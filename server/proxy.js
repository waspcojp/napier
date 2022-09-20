const Redbird = require('redbird');
const {HTTP_PORT, HTTPS_PORT, WS_PORT, LOCAL_PORT_RANGE, APPL_PORT, MY_HOST, MY_DOMAIN} = require('../config/server.js');
const Tunnel = require('./tunnel');
const staticRoute = require('../config/static');

const proxy = Redbird({
    port: HTTP_PORT,
    secure: true,
    ssl: {
        port: HTTPS_PORT,
        key:  `./certs/${MY_DOMAIN}.pem`,
        cert: `./certs/${MY_DOMAIN}-cert.pem`
/*
        letsencrypt: {
            path: `./certs`,
            port: 8000,
            email: 'ogochan@wasp.co.jp',
            production: false
        }
*/
    }
});
proxy.notFound((req, res) => {
    res.statusCode = 404;
    res.write('proxy not found');
    res.end();
})

proxy.register(`${MY_HOST}`, `localhost:${APPL_PORT}`, {
    ssl: {                              //  force https
        key:  `./certs/${MY_DOMAIN}.pem`,
        cert: `./certs/${MY_DOMAIN}-cert.pem`
    },
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