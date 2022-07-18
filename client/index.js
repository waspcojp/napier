const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const {decodeMessage, encodeText, encodeChannelPacket, TYPE_CONNECT, TYPE_CLOSE, TYPE_DATA} = require('../libs/message');
const EventEmitter = require('events');
const Recv = new EventEmitter();

const LOCAL_PORT = 4000;

let channels = [0]
let sequence;
let session;

const server = http.createServer((req, res) => {
    console.log('host', req.headers.host);
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        data: 'Hello'
    }));
});

let ws = new WebSocket('ws://localhost:8001');

const Api = (ws, func, arg, callback) => {
    ws.send(encodeText(0, JSON.stringify({
        method: func,
        message_id: sequence,
        body: arg
    })));
    if  ( callback )    {
        Recv.on(`recv:${sequence}`, callback);
    }
}

ws.on('message', (message) => {
    let recv = decodeMessage(message);
    //console.log({recv});
    if  ( recv.channel == 0 )   {
        let body = JSON.parse(recv.body);
        Recv.emit(`recv:${body.message_id}`, body);
    } else {
        if  ( recv.body )   {
            console.log('channel data', recv.channel);
            channels[recv.channel].write(recv.body);
        } else {
            switch( recv.type ) {
              case  TYPE_CLOSE:
                if  ( channels[recv.channel] )  {
                    console.log('channel close', recv.channel);
                    //channels[recv.channel].end();
                    channels[recv.channel] = undefined;
                }
                break;
              case  TYPE_CONNECT:
                console.log('channel connect', recv.channel);
                let localSocket = net.createConnection({
                    host: 'localhost',
                    port: LOCAL_PORT
                });
                localSocket.on('data', (buff) => {
                    //console.log('buff', buff.toString());
                    ws.send(encodeChannelPacket(recv.channel, TYPE_DATA, buff));
                });
                channels[recv.channel] = localSocket;
                break;
            }
        }
    }
});

ws.on('open', (e) => {
    console.log('open', e);
    sequence = 0;
    Api(ws, 'auth', {
            user: 'ogochan',
            password:  '***'
        },
        (body) => {
            console.log('body', body);
            sequence += 1;
            if  ( body.status == 'OK')  {
                session = body.id;
                Api(ws, 'profiles', null, 
                    (body) => {
                        console.log('profiles', body);
                    });
                Api(ws, 'start', {
                        name: 'vhost1'
                    },
                    (body) => {
                        if  ( body.status != 'OK')  {
                            console.log('error:', body.error);
                            ws.close();
                        }
                    });
            }
        });
});
