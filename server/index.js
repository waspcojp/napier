const Redbird = require('redbird');
const {HTTP_PORT, HTTPS_PORT, WS_PORT, LOCAL_PORT_RANGE} = require('../config/server.js');
const Es = require('electrode-server');

const Tunnel = require('./tunnel');

const proxy = Redbird({
    port: HTTP_PORT,
    secure: false,
    ssl: {
        port: HTTPS_PORT,
        key:  './certs/10.1.254.11-key.pem',
        cert: './certs/10.1.254.11-cert.pem'
    }
});
proxy.notFound((req, res) => {
    res.statusCode = 404;
    res.write('proxy not found');
    res.end();
})
const tunnel = new Tunnel(proxy, WS_PORT, LOCAL_PORT_RANGE);

tunnel.run();
console.log('tunnel run');
/*
Es({
    connection: {
        port: WEB_PORT
    }
}).then((server) =>{
    server.route({
        method: 'get',
        path: '/',
        handler: (req, h) => {
            return  'default';
        }
    });
    
});

console.log('server run');
*/
