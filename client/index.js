const http = require('http');
const WebSocket = require('ws');
const net = require('net');
const {decodeMessage, encodeText, encodeChannelPacket, TYPE_CONNECT, TYPE_CLOSE, TYPE_DATA} = require('../libs/message');
const EventEmitter = require('events');

const LOCAL_PORT = 4000;

let channels = [0]
const   searchFreeChannel = () => {
    let channel;
    for ( let i = 1 ; i < channels.length ; i += 1 )    {
        if  ( !channels[i] )    {
            channel = i;
            break;
        }
    }
    if  ( !channel )    {
        channel = channels.length;
        channels.push(channel);
    }
    return  (channel);
}

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

ws.on('message', (message) => {
    let recv = decodeMessage(message);
    //console.log({recv});
    if  ( recv.channel == 0 )   {
        let body = JSON.parse(recv.body);
        if  ( body.message_id == sequence )   {
            Recv.emit('recv', body);
        }
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

let sequence;
const Recv = new EventEmitter();
let session;
ws.on('open', (e) => {
    console.log('open', e);
    sequence = 0;
    ws.send(encodeText(0, JSON.stringify({
        method: 'auth',
        message_id: sequence,
        body: {
            user: 'ogochan',
            password:  '***'
        }
    })));
    Recv.on('recv', (body) => {
        console.log('body', body);
        sequence += 1;
        if  ( body.status == 'OK')  {
            session = body.id;
            ws.send(encodeText(0, JSON.stringify({
                method: 'start',
                message_id: sequence,
                body: {
                    name: 'real'
                }
            })));
        }
    })
});
