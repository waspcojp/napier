const Redbird = require('redbird');
const {HTTP_PORT, HTTPS_PORT, WS_PORT, LOCAL_PORT_RANGE, APPL_PORT} = require('../config/server.js');
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

proxy.register('10.1.254.11/manage', `localhost:${APPL_PORT}`, {
    onRequest: (req, res, target) => {
        console.log('manage', target);
    }
});

module.exports = new Tunnel(proxy, WS_PORT, LOCAL_PORT_RANGE);