const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const {decodeMessage, encodeText, encodeChannelPacket, TYPE_CONNECT, TYPE_CLOSE, TYPE_DATA} = require('../libs/message');
const EventEmitter = require('events');
const Recv = new EventEmitter();

const LOCAL_PORT = 4000;

let channels = [0]
let sequence = 0;
let session_id;

/*
const server = http.createServer((req, res) => {
    console.log('host', req.headers.host);
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });
    res.end(JSON.stringify({
        data: 'Hello'
    }));
});
*/

const Api = (ws, func, arg, callback) => {
    ws.send(encodeText(0, JSON.stringify({
        method: func,
        session_id: session_id,
        message_id: sequence,
        body: arg
    })));
    if  ( callback )    {
        Recv.on(`recv:${sequence}`, (body) => {
            callback(body);
            Recv.removeAllListeners(`recv:${sequence}`);
        });
    }
    sequence += 1;
}

let ws = new WebSocket('ws://localhost:8001');

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
    Api(ws, 'auth', {
            user: 'ogochan',
            password:  '***'
            //password:  'ogochan'
        },
        (body) => {
            console.log('body', body);
            if  ( body.status == 'OK')  {
                session_id = body.id;
                Api(ws, 'profiles', null, 
                    (body) => {
                        console.log('profiles', body.profiles);
                    });
/*              Api(ws, 'passwd', {
                    old: '***',
                    new: 'ogochan'
                },
                (body) => {
                    console.log('passwd', body);
                });
                Api(ws, 'del_profile', {
                        name: 'real'
                    },
                    (body) => {
                        console.log('del_profile', body);
                        Api(ws, 'profiles', null, 
                            (body) => {
                                console.log('afre del profiles', body);
                            }
                        );
                    }
                );
*/
                Api(ws, 'put_profile', {
                        name: 'vhost3',
                        path: 'www.wasp.co.jp'
                    },
                    (body) => {
                        console.log('put_profile', body);
                        Api(ws, 'profiles', null, 
                            (body) => {
                                console.log('afre put profiles', body.profiles);
                            }
                        );
                    }
                );
/*
*/
                Api(ws, 'start', {
                        name: 'vhost1'
                    },
                    (body) => {
                        if  ( body.status != 'OK')  {
                            console.log('error:', body.error);
                            ws.close();
                        }
                    });
            } else {
                ws.close();
            }
        });
});
