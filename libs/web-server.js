//const handler = require('serve-handler');	//	https://github.com/vercel/serve-handler
const http = require('http');

// Native
const {promisify} = require('util');
const path = require('path');
const {createHash} = require('crypto');
const {realpath, lstat, createReadStream, readdir, readFileSync, existsSync} = require('fs');

const ORIGINAL = '../node_modules/serve-handler/src';

// Packages
const url = require('fast-url-parser');
const slasher = require(`${ORIGINAL}/glob-slash`);
const minimatch = require('minimatch');
const pathToRegExp = require('path-to-regexp');
const mime = require('mime-types');
const bytes = require('bytes');
const contentDisposition = require('content-disposition');
const isPathInside = require('path-is-inside');
const parseRange = require('range-parser');

// Other
const errorTemplate = require(`${ORIGINAL}/error`);

// EJS support
const ejs = require('ejs');

// markdown support
const MarkdownIt = require('markdown-it');
const Emoji = require("markdown-it-emoji");
const Prism = require("markdown-it-prism");
const ReplaceLink = require("markdown-it-replace-link");
require("prismjs/components/prism-bash");
require("prismjs/components/prism-c");
require("prismjs/components/prism-clike");
require("prismjs/components/prism-cpp.js");
require("prismjs/components/prism-javascript");
require("prismjs/components/prism-http");
require("prismjs/components/prism-llvm");
require("prismjs/components/prism-makefile");
require("prismjs/components/prism-ruby");
require("prismjs/components/prism-python");
require("prismjs/components/prism-shell-session");

const etags = new Map();

const pathParse = (url_path) => {
	let el = url_path.split('?');
	let file = el[0];
	let params = {};
	if	( el[1] ) {
		let parts = el[1].split('&');
		for ( let part of parts )	{
			let p = part.split('=');
			params[p[0]] = p[1];
		}
	}
	return	({
		pathname: file,
		params: params
	});
}


const calculateSha = (handlers, absolutePath) =>
	new Promise((resolve, reject) => {
		const hash = createHash('sha1');
		hash.update(path.extname(absolutePath));
		hash.update('-');
		const rs = handlers.createReadStream(absolutePath);
		rs.on('error', reject);
		rs.on('data', buf => hash.update(buf));
		rs.on('end', () => {
			const sha = hash.digest('hex');
			resolve(sha);
		});
	});

const sourceMatches = (source, requestPath, allowSegments) => {
	const keys = [];
	const slashed = slasher(source);
	const resolvedPath = path.posix.resolve(requestPath);

	let results = null;

	if (allowSegments) {
		const normalized = slashed.replace('*', '(.*)');
		const expression = pathToRegExp.pathToRegexp(normalized, keys);

		results = expression.exec(resolvedPath);

		if (!results) {
			// clear keys so that they are not used
			// later with empty results. this may
			// happen if minimatch returns true
			keys.length = 0;
		}
	}

	if (results || minimatch(resolvedPath, slashed)) {
		return {
			keys,
			results
		};
	}

	return null;
};

const toTarget = (source, destination, previousPath) => {
	const matches = sourceMatches(source, previousPath, true);

	if (!matches) {
		return null;
	}

	const {keys, results} = matches;

	const props = {};
	const {protocol} = url.parse(destination);
	const normalizedDest = protocol ? destination : slasher(destination);
	const toPath = pathToRegExp.compile(normalizedDest);

	for (let index = 0; index < keys.length; index++) {
		const {name} = keys[index];
		props[name] = results[index + 1];
	}

	return toPath(props);
};

const applyRewrites = (requestPath, rewrites = [], repetitive) => {
	// We need to copy the array, since we're going to modify it.
	const rewritesCopy = rewrites.slice();
	// If the method was called again, the path was already rewritten
	// so we need to make sure to return it.
	const fallback = repetitive ? requestPath : null;

	if (rewritesCopy.length === 0) {
		return fallback;
	}
	for (let index = 0; index < rewritesCopy.length; index++) {
		const {source, destination} = rewrites[index];
		const target = toTarget(source, destination, requestPath);
		if (target) {
			// Remove rules that were already applied
			rewritesCopy.splice(index, 1);

			// Check if there are remaining ones to be applied
			return applyRewrites(slasher(target), rewritesCopy, true);
		}
	}

	return fallback;
};

const ensureSlashStart = target => (target.startsWith('/') ? target : `/${target}`);

const shouldRedirect = (decodedPath, {redirects = [], trailingSlash}, cleanUrl) => {
	const slashing = typeof trailingSlash === 'boolean';
	const defaultType = 301;
	const matchHTML = /(\.html|\/index)$/g;

	if (redirects.length === 0 && !slashing && !cleanUrl) {
		return null;
	}

	// By stripping the HTML parts from the decoded
	// path *before* handling the trailing slash, we make
	// sure that only *one* redirect occurs if both
	// config options are used.
	if (cleanUrl && matchHTML.test(decodedPath)) {
		decodedPath = decodedPath.replace(matchHTML, '');
		if (decodedPath.indexOf('//') > -1) {
			decodedPath = decodedPath.replace(/\/+/g, '/');
		}
		return {
			target: ensureSlashStart(decodedPath),
			statusCode: defaultType
		};
	}

	if (slashing) {
		const {ext, name} = path.parse(decodedPath);
		const isTrailed = decodedPath.endsWith('/');
		const isDotfile = name.startsWith('.');

		let target = null;

		if (!trailingSlash && isTrailed) {
			target = decodedPath.slice(0, -1);
		} else if (trailingSlash && !isTrailed && !ext && !isDotfile) {
			target = `${decodedPath}/`;
		}

		if (decodedPath.indexOf('//') > -1) {
			target = decodedPath.replace(/\/+/g, '/');
		}

		if (target) {
			return {
				target: ensureSlashStart(target),
				statusCode: defaultType
			};
		}
	}

	// This is currently the fastest way to
	// iterate over an array
	for (let index = 0; index < redirects.length; index++) {
		const {source, destination, type} = redirects[index];
		const target = toTarget(source, destination, decodedPath);

		if (target) {
			return {
				target,
				statusCode: type || defaultType
			};
		}
	}

	return null;
};

const appendHeaders = (target, source) => {
	for (let index = 0; index < source.length; index++) {
		const {key, value} = source[index];
		target[key] = value;
	}
};

const getHeaders = async (handlers, config, current, absolutePath, stats) => {
	const {headers: customHeaders = [], etag = false} = config;
	const related = {};
	const {base} = path.parse(absolutePath);
	const relativePath = path.relative(current, absolutePath);

	if (customHeaders.length > 0) {
		// By iterating over all headers and never stopping, developers
		// can specify multiple header sources in the config that
		// might match a single path.
		for (let index = 0; index < customHeaders.length; index++) {
			const {source, headers} = customHeaders[index];

			if (sourceMatches(source, slasher(relativePath))) {
				appendHeaders(related, headers);
			}
		}
	}

	let defaultHeaders = {};

	if (stats) {
		defaultHeaders = {
			'Content-Length': stats.size,
			// Default to "inline", which always tries to render in the browser,
			// if that's not working, it will save the file. But to be clear: This
			// only happens if it cannot find a appropiate value.
			'Content-Disposition': contentDisposition(base, {
				type: 'inline'
			}),
			'Accept-Ranges': 'bytes'
		};

		if (etag) {
			let [mtime, sha] = etags.get(absolutePath) || [];
			if (Number(mtime) !== Number(stats.mtime)) {
				sha = await calculateSha(handlers, absolutePath);
				etags.set(absolutePath, [stats.mtime, sha]);
			}
			defaultHeaders['ETag'] = `"${sha}"`;
		} else {
			defaultHeaders['Last-Modified'] = stats.mtime.toUTCString();
		}

		const contentType = mime.contentType(base);

		if (contentType) {
			defaultHeaders['Content-Type'] = contentType;
		}
	}

	const headers = Object.assign(defaultHeaders, related);

	for (const key in headers) {
		if (headers.hasOwnProperty(key) && headers[key] === null) {
			delete headers[key];
		}
	}

	return headers;
};

const applicable = (decodedPath, configEntry) => {
	if (typeof configEntry === 'boolean') {
		return configEntry;
	}

	if (Array.isArray(configEntry)) {
		for (let index = 0; index < configEntry.length; index++) {
			const source = configEntry[index];

			if (sourceMatches(source, decodedPath)) {
				return true;
			}
		}

		return false;
	}

	return true;
};

const getPossiblePaths = (relativePath, extension) => [
	path.join(relativePath, `index${extension}`),
	relativePath.endsWith('/') ? relativePath.replace(/\/$/g, extension) : (relativePath + extension)
].filter(item => path.basename(item) !== extension);

const findRelated = async (current, relativePath, rewrittenPath, originalStat) => {
	const possible = rewrittenPath ? [rewrittenPath] : getPossiblePaths(relativePath, '.html');

	let stats = null;

	for (let index = 0; index < possible.length; index++) {
		const related = possible[index];
		const absolutePath = path.join(current, related);

		try {
			stats = await originalStat(absolutePath);
		} catch (err) {
			if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
				throw err;
			}
		}

		if (stats) {
			return {
				stats,
				absolutePath
			};
		}
	}

	return null;
};

const canBeListed = (excluded, file) => {
	const slashed = slasher(file);
	let whether = true;

	for (let mark = 0; mark < excluded.length; mark++) {
		const source = excluded[mark];

		if (sourceMatches(source, slashed)) {
			whether = false;
			break;
		}
	}

	return whether;
};

const renderDirectory = async (current, acceptsJSON, handlers, methods, config, paths) => {
	const {directoryListing, trailingSlash, unlisted = [], renderSingle} = config;
	const slashSuffix = typeof trailingSlash === 'boolean' ? (trailingSlash ? '/' : '') : '/';
	const {relativePath, absolutePath} = paths;
	const excluded = [
		'.DS_Store',
		'.git',
		...unlisted
	];

	if (!applicable(relativePath, directoryListing) && !renderSingle) {
		return {};
	}

	let files = await handlers.readdir(absolutePath);

	const canRenderSingle = renderSingle && (files.length === 1);

	for (let index = 0; index < files.length; index++) {
		const file = files[index];

		const filePath = path.resolve(absolutePath, file);
		const details = path.parse(filePath);

		// It's important to indicate that the `stat` call was
		// spawned by the directory listing, as Now is
		// simulating those calls and needs to special-case this.
		let stats = null;

		if (methods.lstat) {
			stats = await handlers.lstat(filePath, true);
		} else {
			stats = await handlers.lstat(filePath);
		}

		details.relative = path.join(relativePath, details.base).slice(1);

		if (stats.isDirectory()) {
			details.base += slashSuffix;
			details.relative += slashSuffix;
			details.type = 'folder';
		} else {
			if (canRenderSingle) {
				return {
					singleFile: true,
					absolutePath: filePath,
					stats
				};
			}

			details.ext = details.ext.split('.')[1] || 'txt';
			details.type = 'file';

			details.size = bytes(stats.size, {
				unitSeparator: ' ',
				decimalPlaces: 0
			});
		}

		details.title = details.base;

		if (canBeListed(excluded, file)) {
			files[index] = details;
		} else {
			delete files[index];
		}
	}

	const toRoot = path.relative(current, absolutePath);
	const directory = path.join(toRoot, slashSuffix);
	const pathParts = directory.split(path.sep).filter(Boolean);

	// Sort to list directories first, then sort alphabetically
	files = files.sort((a, b) => {
		const aIsDir = a.type === 'directory';
		const bIsDir = b.type === 'directory';

		/* istanbul ignore next */
		if (aIsDir && !bIsDir) {
			return -1;
		}

		if ((bIsDir && !aIsDir) || (a.base > b.base)) {
			return 1;
		}

		/* istanbul ignore next */
		if (a.base < b.base) {
			return -1;
		}

		/* istanbul ignore next */
		return 0;
	}).filter(Boolean);


	// Add parent directory to the head of the sorted files array
	if (toRoot.length > 0) {
		const directoryPath = [...pathParts].slice(1);
		const relative = path.join(...directoryPath, '..', slashSuffix);

		files.unshift({
			type: 'directory',
			base: '..',
			relative,
			title: relative,
			ext: ''
		});
	}

	const subPaths = [];

	for (let index = 0; index < pathParts.length; index++) {
		const parents = [];
		const isLast = index === (pathParts.length - 1);

		let before = 0;

		while (before <= index) {
			parents.push(pathParts[before]);
			before++;
		}

		parents.shift();

		subPaths.push({
			name: pathParts[index] + (isLast ? slashSuffix : '/'),
			url: index === 0 ? '' : parents.join('/') + slashSuffix
		});
	}

	const spec = {
		files,
		directory,
		paths: subPaths
	};
	let output;
	if	( acceptsJSON )	{
		output = JSON.stringify(spec);
	} else {
		output = loadContent('./libs/directory.ejs', {}, spec);
	}
	return {directory: output};
};

const sendError = async (absolutePath, response, acceptsJSON, current, handlers, config, spec) => {
	const {err: original, message, code, statusCode} = spec;

	/* istanbul ignore next */
	if (original && process.env.NODE_ENV !== 'test') {
		console.error(original);
	}

	response.statusCode = statusCode;

	if (acceptsJSON) {
		response.setHeader('Content-Type', 'application/json; charset=utf-8');

		response.end(JSON.stringify({
			error: {
				code,
				message
			}
		}));

		return;
	}

	let stats = null;

	const errorPage = path.join(current, `${statusCode}.html`);

	try {
		stats = await handlers.lstat(errorPage);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			console.error(err);
		}
	}

	if (stats) {
		let stream = null;

		try {
			stream = await handlers.createReadStream(errorPage);

			const headers = await getHeaders(handlers, config, current, errorPage, stats);

			response.writeHead(statusCode, headers);
			stream.pipe(response);

			return;
		} catch (err) {
			console.error(err);
		}
	}

	const headers = await getHeaders(handlers, config, current, absolutePath, null);
	headers['Content-Type'] = 'text/html; charset=utf-8';

	response.writeHead(statusCode, headers);
	response.end(errorTemplate({statusCode, message}));
};

const internalError = async (...args) => {
	const lastIndex = args.length - 1;
	const err = args[lastIndex];

	args[lastIndex] = {
		statusCode: 500,
		code: 'internal_server_error',
		message: 'A server error has occurred',
		err
	};

	return sendError(...args);
};

const getHandlers = methods => Object.assign({
	lstat: promisify(lstat),
	realpath: promisify(realpath),
	createReadStream,
	readdir: promisify(readdir),
	sendError
}, methods);


const mdInit = (_path) => {
	let dir = path.dirname(_path);
	let _markdown = new MarkdownIt({
			html:         true,        // Enable HTML tags in source
			xhtmlOut:     false,        // Use '/' to close single tags (<br />)
			breaks:       false,        // Convert '\n' in paragraphs into <br>
			linkify:      true,         // autoconvert URL-like texts to links
			typographer:  true,         // Enable smartypants and other sweet transforms
		})
		.use((Emoji))
		.use((Prism), {
			plugins: [
				'line-numbers'
			],
			defaultLanguage: 'clike'});
	_markdown.renderer.rules.table_open = () => {
		return '<table class="table table-striped">\n';
	};
/*
	_markdown.renderer.rules.paragraph_open =
	_markdown.renderer.rules.heading_open = (tokens, idx, options, env, slf) => {
		let line;
		if (tokens[idx].map && tokens[idx].level === 0) {
			line = tokens[idx].map[0];
			tokens[idx].attrJoin('class', 'line');
			tokens[idx].attrSet('data-line', String(line));
		}
		return slf.renderToken(tokens, idx, options, env, slf);
	}
*/
	return(_markdown);
}

const renderMarkdown = (absolutePath, config, toplevel, opts) => {
	try {
		let markdown = mdInit('');
		let source = readFileSync(absolutePath, 'utf-8');
		let inner_html = markdown.render(source);
		if	( toplevel )	{
			return	loadContent('./libs/markdown.html', config, toplevel, opts);
		} else {
			return	(inner_html);
		}
	} catch(err)	{
		console.log('markdown render error', err);
		return	('');
	}
}

let current;	//	current content path

const renderEJS = (absolutePath, config, opts) => {
	//console.log('render EJS', absolutePath, opts);
	try {
		let source = readFileSync(absolutePath, 'utf-8');
		let inner_html = ejs.render(source, { opts: opts }, {
			filename: absolutePath
		});
		return	(inner_html);
	} catch(err)	{
		console.log('EJS render error', err);
		return	('');
	}	
}
const renderHTML = (thisPath,config,  toplevel, opts) => {
	let file = readFileSync(thisPath, 'utf-8');
	content = file.replaceAll(/\{\{(.*?)\}\}/sg, (_, macro) => {
		let verb;
		let reference;
		let _opts;
		//console.log('macro', macro);
		if	( macro.match(/^#/) )	{
			return	'';
		}
		if	( macro.match(/^.*>/) ) {
			let words = parseMacro(macro);
			//console.log({words});
			verb = words[0];
			reference = words[1];
			if	( words[2] )	{
				try {
					_opts = Function(`return (${words[2]});`)();
					//console.log('_opts', words[2], _opts);
				} catch(e) {
					console.log('eval', words[2]);
					console.log(e);
				}
			}
		} 
		try {
			//console.log('verb:', verb, ':', reference, ':', _opts);
			if	( verb === '>' )	{
				let name;
				if	( reference )	{
					name = reference.trim();
				} else {
					name = opts.pathname;
				}
				//console.log({name});
				let componentPath;
				if	( name.match(/^\//) )	{
					componentPath = path.join(config['public'], path.normalize(name).slice(1));
				} else {
					componentPath = path.join(path.dirname(thisPath), path.normalize(name));
				}
				if ( existsSync(componentPath) ) {
					return loadContent(componentPath, config, false, _opts);
				} else {
					console.log('component not found', componentPath);
					return	'';
				}
			} else {
				return _eval(`${macro}`, opts);
			}
		} catch(e) {
			console.log(e);
			return	'';
		}
	});
	return	(content);
}
const _eval = (s, _opts) => {
	let opts = _opts ? _opts : undefined;
	//console.log('_eval', s, ':', opts);
	try {
		let ret = eval(s).toString();
		//console.log('ret', ret);
		return	ret;
	} catch (e) {
		console.log('eval>', s);
		console.log(e);
		return	'';
	}
}
const parseMacro = (s) => {
	let token = []
	let ms;
	//console.log('input', s);
	if	( ms = s.match(/^(>)\s+([\/,\.,\w]+)\s*(.*)/s) )	{
		//console.log('ms',ms);
		for	( let i = 1; i < ms.length ; i += 1)	{
			token.push(ms[i]);
		}
	} else
	if  ( ms = s.match(/^(>)\s*/))	{
		token.push(ms[1]);
	} else {
		token.push(s);
	}
	//console.log('token', token);
	return	(token);
}
const loadContent = (thisPath, config, toplevel, opts) => {
	console.log('load:', thisPath);
	//console.log('opts:', opts);
	let content;
	if	( ( config ) && ( config.markdown ) && ( thisPath.match(/\.md/g) ) )	{
		content = renderMarkdown(thisPath, config, toplevel, opts);
	} else
	if	( thisPath.match(/\.ejs/g) )	{
		content = renderEJS(thisPath, config, opts);
	} else
	if	( thisPath.match(/\.html/g) )	{
		content = renderHTML(thisPath, config, toplevel, opts);
		//console.log(content);
	}
	return	(content);
}

const getDirectory = async (request, response, handlers, config, absolutePath, relativePath, stats, acceptsJSON, methods) => {
	let directory = null;
	let singleFile = null;

	try {
		const related = await renderDirectory(current, acceptsJSON, handlers, methods, config, {
			relativePath,
			absolutePath
		});

		if (related.singleFile) {
			({stats, absolutePath, singleFile} = related);
		} else {
			({directory} = related);
		}
	} catch (err) {
		if (err.code !== 'ENOENT') {
			return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
		}
	}

	if (directory) {
		const contentType = acceptsJSON ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8';

		response.statusCode = 200;
		response.setHeader('Content-Type', contentType);
		response.end(directory);

		return true;
	}

	if (!singleFile) {
		// The directory listing is disabled, so we want to
		// render a 404 error.
		stats = null;
	}

}

const getTextContent = (request, response, config, absolutePath, relativePath) => {
	let params = pathParse(request.url).params;
	let content = loadContent(absolutePath, config, true, {
		params: params,
		pathname: relativePath,
		current: current
	});
	if	( content )	{
		response.statusCode = 200;
		response.setHeader('Content-Type', 'text/html; charset=utf-8');
		response.end(content);
	
		return true;
	} else {
		return false;
	}
}

const getNonTextContent = async (request, response, config, absolutePath, relativePath, stats, handlers) => {
	const headers = await getHeaders(handlers, config, current, absolutePath, stats);

	const streamOpts = {};

	// TODO ? if-range
	if (request.headers.range && stats.size) {
		const range = parseRange(stats.size, request.headers.range);

		if (typeof range === 'object' && range.type === 'bytes') {
			const {start, end} = range[0];

			streamOpts.start = start;
			streamOpts.end = end;

			response.statusCode = 206;
		} else {
			response.statusCode = 416;
			response.setHeader('Content-Range', `bytes */${stats.size}`);
		}
	}

	// TODO ? multiple ranges

	let stream = null;

	try {
		//console.log('read:', absolutePath);
		stream = await handlers.createReadStream(absolutePath, streamOpts);
	} catch (err) {
		return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
	}

	// eslint-disable-next-line no-undefined
	if (streamOpts.start !== undefined && streamOpts.end !== undefined) {
		headers['Content-Range'] = `bytes ${streamOpts.start}-${streamOpts.end}/${stats.size}`;
		headers['Content-Length'] = streamOpts.end - streamOpts.start + 1;
	}

	// We need to check for `headers.ETag` being truthy first, otherwise it will
	// match `undefined` being equal to `undefined`, which is true.
	//
	// Checking for `undefined` and `null` is also important, because `Range` can be `0`.
	//
	// eslint-disable-next-line no-eq-null
	if (request.headers.range == null && headers.ETag && headers.ETag === request.headers['if-none-match']) {
		response.statusCode = 304;
		response.end();

		return;
	}

	response.writeHead(response.statusCode || 200, headers);
	stream.pipe(response);

}
const execGET = async (request, response, config, absolutePath, relativePath, stats, acceptsJSON, handlers, methods) => {
	if (stats && stats.isDirectory()) {		//	directory
		if	( await getDirectory(request, response, handlers, config,
							absolutePath, relativePath, stats,
							acceptsJSON, methods) )	return;
	}

	const isSymLink = stats && stats.isSymbolicLink();

	if (!stats || (!config.symlinks && isSymLink)) {
		// allow for custom 404 handling
		return handlers.sendError(absolutePath, response, acceptsJSON, current, handlers, config, {
			statusCode: 404,
			code: 'not_found',
			message: 'The requested path could not be found'
		});
	}
	if (isSymLink) {
		absolutePath = await handlers.realpath(absolutePath);
		stats = await handlers.lstat(absolutePath);
	}


	//
	//	read contents here!!
	//
	if	( getTextContent(request, response, config, absolutePath, relativePath) ) {
		return;
	}
	await getNonTextContent(request, response, config, absolutePath, relativePath, stats,
		handlers);

}

const handler = async (request, response, config = {}, methods = {}) => {
	const cwd = process.cwd();
	const handlers = getHandlers(methods);

	//console.log(config);
	//console.log('url', request.url);

	let relativePath = null;
	let acceptsJSON = null;
	current = config.public ? path.resolve(cwd, config.public) : cwd;

	if (request.headers.accept) {
		acceptsJSON = request.headers.accept.includes('application/json');
	}

	try {
		relativePath = decodeURIComponent(url.parse(request.url).pathname);
	} catch (err) {
		console.log(err);
		return sendError('/', response, acceptsJSON, current, handlers, config, {
			statusCode: 400,
			code: 'bad_request',
			message: 'Bad Request'
		});
	}
	let absolutePath = path.join(current, relativePath);

	// Prevent path traversal vulnerabilities. We could do this
	// by ourselves, but using the package covers all the edge cases.
	if (!isPathInside(absolutePath, current)) {
		return sendError(absolutePath, response, acceptsJSON, current, handlers, config, {
			statusCode: 400,
			code: 'bad_request',
			message: 'Bad Request'
		});
	}

	const cleanUrl = applicable(relativePath, config.cleanUrls);
/*
	const redirect = shouldRedirect(relativePath, config, cleanUrl);

	if (redirect) {
		response.writeHead(redirect.statusCode, {
			Location: encodeURI(redirect.target)
		});

		response.end();
		return;
	}
*/
	let stats = null;

	// It's extremely important that we're doing multiple stat calls. This one
	// right here could technically be removed, but then the program
	// would be slower. Because for directories, we always want to see if a related file
	// exists and then (after that), fetch the directory itself if no
	// related file was found. However (for files, of which most have extensions), we should
	// always stat right away.
	//
	// When simulating a file system without directory indexes, calculating whether a
	// directory exists requires loading all the file paths and then checking if
	// one of them includes the path of the directory. As that's a very
	// performance-expensive thing to do, we need to ensure it's not happening if not really necessary.

	if (path.extname(relativePath) !== '') {
		try {
			stats = await handlers.lstat(absolutePath);
		} catch (err) {
			if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
				return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
			}
		}
	}
	const rewrittenPath = applyRewrites(relativePath, config.rewrites);
//	if (!stats && (cleanUrl || rewrittenPath)) {	元々のロジックでは、素のHTMLがない時だけrewriteが発動していた。テンプレート適用機能{{>}}のために潰す
	if (cleanUrl || rewrittenPath) {
		try {
			const related = await findRelated(current, relativePath, rewrittenPath, handlers.lstat);

			if (related) {
				({stats, absolutePath} = related);
			}
		} catch (err) {
			if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
				return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
			}
		}
	}
	if (!stats) {
		try {
			stats = await handlers.lstat(absolutePath);
		} catch (err) {
			if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
				return internalError(absolutePath, response, acceptsJSON, current, handlers, config, err);
			}
		}
	}
	switch	( request.method)	{
	  case	'GET':
		await execGET(request, response, config, absolutePath, relativePath, stats, acceptsJSON, handlers, methods);
		break;
	  default:
		break;
	}
};

let server = null;

const readMap = (root) => {
	const filename = path.join(root, 'map.rules');
	let rewrite = [];
	let redirect = [];

	if	( existsSync(filename) )	{
		let file = readFileSync(filename, 'utf-8');
		let items;
		for	( let line of file.split('\n') )	{
			if	( items = line.split(/\s+/) )	{
				//console.log(items);
				if	( items[0].match(/rewriterule/i) )	{
					rewrite.push({
						source: items[1],
						destination: items[2]
					});
				} else
				if	( items[0].match(/redirectrule/i) )	{
					redirect.push({
						source: items[1],
						destination: items[2]
					});
				}
			}
		}
	}
	return	({
		rewrite: rewrite,
		redirect: redirect
	});
}

const start = (port, root, option) => {
	option ||= {};
	option['public'] = root;
	let {rewrite, redirect} = readMap(root);
	option['rewrites'] = rewrite;
	option['redirects'] = redirect;
	//console.log({option});
	thisConfig = option;

	if	( !server )	{
		server = http.createServer((req, res) => {
			//console.log('req', req.method, req.url, )
			return	handler(req, res, option, {
			});
		});

		server.listen(port, () => {
			//console.log('start web server');
		});
	}
}
const stop = () => {
	return new Promise((resolve, reject) => {
		try	{
			server.close(() => {
				resolve();
				server = null;
				//console.log('web server stoppped');
			});
		} catch {
			reject();
		}
	});
}

const check = () => {
	return	(server ? server.listening : false);
}

module.exports = {
	applyRewrites: applyRewrites,
	loadContent: loadContent,
	readMap: readMap,
	start: start,
	stop: stop,
	check: check
};
