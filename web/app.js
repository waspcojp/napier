const express = require('express');
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const multipart = require('connect-multiparty');
const cors = require('cors');
const sprightly = require('sprightly');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const {User, is_authenticated} = require('../libs/user');
const contentRouter = express.Router();
const mime = require('mime');
const fs = require('fs');

global.env = require('../config/server');

const homeRouter = require('./routes/home');
const apiRouter = require('./routes/api');

const	makePath = (file) => {
	let orig_path = path.join(global.env.content_path, file);
	let file_path;
	if	( orig_path.match(/\/$/))	{
		file_path = `${orig_path}index.html`;
	} else {
		file_path = orig_path;
	}
	return	(file_path);
}
const	getContent = (req, res) => {
	console.log(req.params);
	let params_path = req.params.path || '/';
	let file_path = makePath(params_path);
	console.log('file', file_path);
	try	{
		let mime_type = mime.getType(file_path);
		if	( mime_type )	{
			res.set('Content-Type', mime_type);
			let	content;
			if	( mime_type.match(/^text\/(?<type>.+)/) )	{
				content = fs.readFileSync(file_path, 'utf-8')
			} else {
				content = fs.readFileSync(file_path);
			}
			res.send(content);
		}
	} catch(e)	{
		console.log('getContent', e);
		res.status(404).send('<h1>page not found</h1>');
	}
}

contentRouter.get('/:path', getContent);
contentRouter.get('/', getContent);

app.use(logger('dev'));		//	アクセスログを見たい時には有効にする
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
	origin: ['*']
}));
app.use(multipart());

app.use(session({
	secret: 'napier',
	resave: true,
	saveUninitialized: false,
	name: 'napier',						//	ここの名前は起動するnode.js毎にユニークにする
	store: new FileStore({
		ttl: global.env.session_ttl,	//	default 3600(s)
		reapInterval: global.env.session_ttl,
		path: global.env.session_path	//	default path
	}),

	cookie: {
		httpOnly: true,
		secure: false,
		maxage: null
	}
}));
app.use(passport.initialize());
app.use(passport.session());


app.engine('spy', sprightly);
app.set('views', './web/views');
app.set('view engine', 'spy');

console.log('/manage/public', (path.join(__dirname, './public')));

app.use('/manage/dist', express.static(path.join(__dirname, './dist')));
app.use('/manage/style', express.static(path.join(__dirname, './front/stylesheets')));
app.use('/manage/public', express.static(path.join(__dirname, './public')));

app.use('/manage/api', apiRouter);

app.use('/manage', homeRouter);
app.use('/', contentRouter);
app.use((err, req, res, next) => {
	res.status(500).send(`<h1>error</h1>`);
	console.log('error', err);
});

module.exports = app;
