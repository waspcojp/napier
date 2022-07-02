const {WebSocketServer} = require('ws');
const httpProxy = require('http-proxy');
const new_id = require('../libs/id');
const TunnelConnection = require('./tunnel-connection');
const net = require('net');
const URL = require('url');

const   do_auth = (session, body) => {
    console.log('auth', body.body);
    let auth;
    auth = true;
    if  ( auth )   {
        session.user = body.body.user;
        session.tunnel.sendControl({
            status: 'OK',
            message_id: body.message_id,
            id: session.id
        });
    } else {
        session.tunnel.sendControl({
            status: 'NG',
            message_id: body.message_id
        });
    }
}

const   searchFreeChannel = (session) => {
    let channel;
    for ( let i = 1 ; i < session.channels.length ; i += 1 )    {
        if  ( !session.channels[i] )    {
            channel = i;
            break;
        }
    }
    if  ( !channel )    {
        channel = session.channels.length;
        session.channels.push({});
    }
    console.log('channel pool max', session.channels.length);
    return  (channel);
}

const   openLocal = (session) => {
    console.log('proxyPort', session.localPort);
    session.channels = [{}];
    let local = net.createServer();
    local.on('connection', (socket) => {
        let channel = searchFreeChannel(session);
        session.channels[channel] = socket;
        console.log('connect', 'channel', channel);
        session.tunnel.connect(channel);
        socket.on('data', (buff) => {
            console.log('data', channel);
            //console.log('buff', buff.toString());
            session.tunnel.sendData(channel, buff);
        });
        socket.on('close', (status) => {
            console.log('close', channel);
            session.tunnel.close(channel);
            session.channels[channel] = undefined;
        })
    });
    let server = local.listen(session.localPort);
}

const   openProxy = (session) => {
    let proxy = new httpProxy.createProxyServer({
        target: {
            host: 'localhost',
            port: session.localPort
        }
    });
    session.proxy = proxy;
}

const   do_start = (session, body) => {
    openLocal(session);
    openProxy(session);
}

module.exports = class {
    constructor  (ws_port, port_range)   {
        this.proxyPort = [];
        this.sessionPool = [];
        this.ws_port = ws_port;
        this.port_range = port_range;
    }
    searchFreePort()    {
        let port;
        for ( let i = this.port_range[0] ; i <= this.port_range[1] ; i += 1)    {
            if  ( !this.proxyPort[i - this.port_range[0]] )   {
                port = i;
                break;
            }
        }
        console.log('port', port);
        return  (port);
    }
    freeSession(index)  {
        console.log('close', index);
        this.sessionPool[index] = undefined;
    }
    searchFreeSession() {
        let index;
        for ( let i = 0 ; i < this.sessionPool.length ; i += 1 ) {
            if  ( !this.sessionPool[i] ) {
                index = i;
                break;
            }
        }
        if  ( !index )  {
            index = this.sessionPool.length;
            this.sessionPool.push({});
        }
        return  ({
            session: this.sessionPool[index],
            index: index
        });
    }
    searchSession(req)   {
        let session;
        let host = req.headers.host;
        let url = URL.parse(req.url);
        let method = req.method;
        console.log(host, method, url);
        for ( let i = 0 ; i < this.sessionPool.length ; i ++ )   {
            if  (   ( session = this.sessionPool[i] ) &&
                    ( session.localPort ) ) break;
        }
        return  (session);
    }
    
    run()   {
        const ws = new WebSocketServer({
            port: this.ws_port
        });
        ws.on('connection', (socket) => {
            let {session, index} = this.searchFreeSession();
            session.id = new_id();
            session.tunnel = new TunnelConnection(socket);
            socket.on('message', (message) => {
                let recv = TunnelConnection.decodeMessage(message);
                //console.log({recv});
                if  ( recv.channel == 0 )   {
                    let body = JSON.parse(recv.body);
                    console.log({body});
                    switch  ( body.method ) {
                      case    'auth':
                        do_auth(session, body);
                        break;
                      case  'start':
                        let port = this.searchFreePort();
                        session.localPort = port;
                        do_start(session, body);
                        break;
                    }
                } else {
                    console.log('recv', recv.channel);
                    let local = session.channels[recv.channel];
                    local.write(recv.body);
                }
            });
            socket.on('close', () => {
                session.localPort
                this.freeSession(index);
            });
        })
    }
}

