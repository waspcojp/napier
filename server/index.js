const {createServer}= require('http');
const Tunnel = require('./tunnel');

const WEB_PORT = 8000;
const WS_PORT = 8001;
const PORT_RANGE = [9000, 9100];

const tunnel = new Tunnel(WS_PORT, PORT_RANGE);

tunnel.run();

const server = createServer((req, res) => {
    //console.log('req', req);
    let session = tunnel.searchSession(req);
    if  ( session ) {
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

