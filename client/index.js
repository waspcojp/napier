const WebSocket = require('ws');
const net = require('net');
const {decodeMessage, encodeText, encodeChannelPacket, TYPE_CONNECT, TYPE_CLOSE, TYPE_DATA} = require('../libs/message');
const EventEmitter = require('events');
const Recv = new EventEmitter();
const {exit} = require('process');

let channels = [0]
let session_id;
const TIMEOUT = 5000;

const Api = (ws, func, arg, callback) => {
    let sequence = ws.sequence;
    let timeout = setTimeout(() => {
        if  ( callback )    {
            callback(null);
            Recv.removeAllListeners(`recv:${sequence}`);
        }
    }, TIMEOUT);
    ws.send(encodeText(0, JSON.stringify({
        method: func,
        session_id: session_id,
        message_id: sequence,
        body: arg
    })));
    if  ( callback )    {
        Recv.on(`recv:${ws.sequence}`, (body) => {
            clearTimeout(timeout);
            callback(body);
            Recv.removeAllListeners(`recv:${sequence}`);
        });
    } else {
        clearTimeout(timeout);
    }
    ws.sequence += 1;
}

const   ping = (ws) => {
    ws.Api('ping', undefined, (body) => {
        //console.log('pong', body);
        if  ( body == null )    {
            ws.Close();
        }
    })
}

const   clientOpen = (localPort, ws_url) => {
    let ws;
    
    try {
        console.log('open', ws_url);
        ws = new WebSocket(ws_url);
        ws.sequence = 0;
        ws.Close = () => {
            //console.log('close');
            if  ( ws.ping )   {
                //console.log('clearInterval');
                clearInterval(ws.ping);
                ws.ping = null;
            }
            ws.close();
        }
    } catch (e) {
        console.log('error', e);
        ws = null;
    }
    if  ( ws )  {
        ws.Api = (func, arg, callback) => {
            Api(ws, func, arg, callback);
        };
        ws.on('message', (message) => {
            let recv = decodeMessage(message);
            if  ( recv.channel == 0 )   {
                let body = JSON.parse(recv.body);
                Recv.emit(`recv:${body.message_id}`, body);
            } else {
                if  ( recv.body )   {
                    if  ( channels[recv.channel] )  {
                        channels[recv.channel].write(recv.body);
                    } else {
                        console.log('closed channel', recv.channel);
                    }
                } else {
                    switch( recv.type ) {
                      case  TYPE_CLOSE:
                        if  ( channels[recv.channel] )  {
                            //console.log('channel close', recv.channel);
                            channels[recv.channel].destroy();
                            channels[recv.channel] = undefined;
                        }
                        break;
                      case  TYPE_CONNECT:
                        //console.log('channel connect', recv.channel);
                        try {
                            let localSocket = net.createConnection({
                                host: 'localhost',
                                port: localPort
                            });
                            localSocket.on('data', (buff) => {
                                //console.log('buff', buff.toString());
                                ws.send(encodeChannelPacket(recv.channel, TYPE_DATA, buff));
                            });
                            localSocket.on('error', () => {
                                localSocket.destroy();
                                localSocket = undefined;
                            })
                            channels[recv.channel] = localSocket;
                        } catch (e) {
                            console.log('local connect error', e);
                        }
                        break;
                    }
                }
            }
        });
        ws.on('error', (e) => {
            console.log('error',e);
            ws.Close();
            ws = null;
        });
        ws.on('open', () => {
            //console.log('opened');
            ws.ping = setInterval(() => {
                ping(ws);
            }, 60 * 1000);
        });
    }
    return  (ws);
}


module.exports = {
    clientOpen: clientOpen,
    Api: Api
};

