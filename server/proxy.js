const Redbird = require('redbird');
const {HTTP_PORT, HTTPS_PORT, WS_PORT, LOCAL_PORT_RANGE, APPL_PORT, MY_HOST} = require('../config/server.js');
const Tunnel = require('./tunnel');
const staticRoute = require('../config/static');

const proxy = Redbird({
    port: HTTP_PORT,
    secure: false,
    ssl: {
        port: HTTPS_PORT,
        key:  `./certs/${MY_HOST}.pem`,
        cert: `./certs/${MY_HOST}-cert.pem`
    }
});
proxy.notFound((req, res) => {
    res.statusCode = 404;
    res.write('proxy not found');
    res.end();
})

proxy.register(`${MY_HOST}/manage`, `localhost:${APPL_PORT}`, {
    onRequest: (req, res, target) => {
        console.log('manage', target);
    }
});

for ( let route of staticRoute )    {
    if  ( route.target )    {
        proxy.register(route.path, route.target);
    }
}

module.exports = new Tunnel(proxy, WS_PORT, LOCAL_PORT_RANGE);