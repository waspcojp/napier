const {APPL_PORT} = require('../config/server.js');
//const http = require('electrode-server');
const http = require('http');
const app = require('../web/app');
const proxy = require('./proxy');

app.set('port', APPL_PORT);
app.set('host', 'localhost');

const server = http.createServer(app);

app.listen(APPL_PORT);

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }
  
    let bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
}
  
/**
* Event listener for HTTP server "listening" event.
*/
  
const onListening = () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
server.on('error', onError);
server.on('listening', onListening);


//proxy.run();

let run = false;
setInterval(() => {
    if  ( !run )    {
        try {
            proxy.run();
            console.log('tunnel run');
            run = true;
        } catch (e) {
            console.log('error', e);
            run = false;
        }
    }
}, 1000);
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

*/
