const handler = require('serve-handler');	//	https://github.com/vercel/serve-handler
const http = require('http');

module.exports = (port, root, option) => {
	option ||= {};
	option['public'] = root;

	let server = http.createServer((req, res) => {
		console.log('req', req.method, req.url,)
		return	handler(req, res, option);
	});

	server.listen(port, () => {
		console.log('start web server');
	});
}
