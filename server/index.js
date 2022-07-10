const Redbird = require('redbird');
const Es = require('electrode-server');

const Tunnel = require('./tunnel');

const WEB_PORT = 8000;
const WS_PORT = 8001;
const PORT_RANGE = [9000, 9100];

const proxy = Redbird({
    port: WEB_PORT,
    secure: false,
    ssl: {
        port: 8443,
        key:  './certs/10.1.254.11-key.pem',
        cert: './certs/10.1.254.11-cert.pem'
    }
});
proxy.notFound((req, res) => {
    res.statusCode = 404;
    res.write('proxy not found');
    res.end();
})
const tunnel = new Tunnel(proxy, WS_PORT, PORT_RANGE);

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
