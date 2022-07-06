const {createServer}= require('http');
const Tunnel = require('./tunnel');
const URL = require('url');

const WEB_PORT = 8000;
const WS_PORT = 8001;
const PORT_RANGE = [9000, 9100];

const tunnel = new Tunnel(WS_PORT, PORT_RANGE);

tunnel.run();
console.log('tunnel run');
const server = createServer((req, res) => {
    //console.log('req', req);
    let session = tunnel.searchSession(req);
    //console.log({session});
    if  ( session ) {
        let profile = session.profile;
        //console.log('url', req.url);
        let reg = profile.path;
        //console.log('rewrite', reg);
        if  ( reg ) {
            req.url = req.url.replace(reg, '');
        }
        //console.log('to', req.url);
        session.proxy.proxyRequest(req, res);
    } else {
        console.log('no proxy');
        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify({
            data: 'Hello'
        }));
    }
});

server.listen(WEB_PORT);
console.log('server run');

