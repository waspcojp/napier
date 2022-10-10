const Redbird = require('redbird');
const {HTTP_PORT, HTTPS_PORT, WS_PORT, LOCAL_PORT_RANGE, APPL_PORT, MY_DOMAIN} = require('../config/server.js');
const Tunnel = require('./tunnel');
const staticRoute = require('../config/static');

const options = {};

if  ( HTTP_PORT )   {
    options['port'] = HTTP_PORT;
}
if  ( HTTPS_PORT )  {
    options['secure'] = true;
    options['ssl'] = {
        port: HTTPS_PORT,
        key:  `./certs/${MY_DOMAIN}.pem`,
        cert: `./certs/${MY_DOMAIN}-cert.pem`
    }
}
const proxy = Redbird(options);

proxy.notFound((req, res) => {
    res.statusCode = 404;
    res.write('proxy not found');
    res.end();
})

proxy.register(`www.${MY_DOMAIN}`, `localhost:${APPL_PORT}`, HTTPS_PORT ? {
    ssl: {                              //  force https
        key:  `./certs/${MY_DOMAIN}.pem`,
        cert: `./certs/${MY_DOMAIN}-cert.pem`
    }
} : undefined);

for ( let route of staticRoute )    {
    if  ( route.target )    {
        proxy.register(route.path, route.target);
    }
}

module.exports = new Tunnel(proxy, WS_PORT, LOCAL_PORT_RANGE);