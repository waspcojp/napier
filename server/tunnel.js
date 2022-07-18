const {WebSocketServer} = require('ws');
const new_id = require('../libs/id');
const TunnelConnection = require('./tunnel-connection');
const {auth, getProfile} = require('./user');
const net = require('net');
const URL = require('url');

class   Session {
    constructor(socket)   {
        this.id = new_id();
        this.tunnel = new TunnelConnection(socket);
        this.channels = [{/* control channel */}];
    }
    searchFreeChannel() {
        let channel;
        for ( let i = 1 ; i < this.channels.length ; i += 1 )    {
            if  ( !this.channels[i] )    {
                channel = i;
                break;
            }
        }
        if  ( !channel )    {
            channel = this.channels.length;
            this.channels.push({});
        }
        console.log('channel pool max', this.channels.length);
        return  (channel);
    }
    set_user(user)  {
        this.user = user;
    }
    start(port, profile) {
        this.localPort = port;
        this.profile = profile;
    }
    connect(channel)    {
        this.tunnel.connect(channel);
    }
    closeChannel(channel)  {
        this.tunnel.close(channel);
    }
    sendData(channel, buff) {
        this.tunnel.sendData(channel, buff);
    }
    sendControl(body)   {
        body.id = this.id;
        this.tunnel.sendControl(body);
    }

    open(proxy) {
        console.log('ssl', this.profile.ssl);
        proxy.register(this.profile.path, `localhost:${this.localPort}`, {
            ssl: this.profile.ssl,
            onRequest: (req, res, target) => {
                console.log('target', target);
            }
        });
    }
    close(proxy) {
        console.log('close', this.localPort);
        if  ( this.profile ) {
            proxy.unregister(this.profile.path);
            this.localServer.close();
        }
    }
    openLocal(){
        console.log('proxyPort', this.localPort);
        let local = net.createServer();
        local.on('connection', (socket) => {
            let channel = this.searchFreeChannel();
            this.channels[channel] = socket;
            console.log('connect', 'channel', channel);
            this.connect(channel);
            socket.on('data', (buff) => {
                console.log('data', channel);
                //console.log('buff', buff.toString());
                this.sendData(channel, buff);
            });
            socket.on('close', (status) => {
                console.log('close', channel);
                this.closeChannel(channel);
                this.channels[channel] = undefined;
            })
        });
        this.localServer = local.listen(this.localPort);
    }
}

const   do_auth = (session, body) => {
    console.log('auth', body.body);
    let user = auth(body.body.user, body.body.password);
    if  ( user )   {
        session.user = user.name;
        session.sendControl({
            status: 'OK',
            message_id: body.message_id
        });
    } else {
        session.sendControl({
            status: 'NG',
            message_id: body.message_id
        });
    }
    return  (user);
}


const   do_start = (proxy, session, body) => {
    session.openLocal();
    session.open(proxy);
}

module.exports = class {
    constructor  (proxy, ws_port, port_range)   {
        this.proxy = proxy;
        this.proxyPort = [];
        this.sessionPool = [];
        this.ws_port = ws_port;
        this.port_range = port_range;
    }
    searchFreePort()    {
        let port;
        for ( let i = this.port_range[0] ; i <= this.port_range[1] ; i += 1)    {
            if  ( !this.proxyPort[i - this.port_range[0]] )   {
                this.proxyPort[i] = i;
                try {
                    let server = net.createServer();
                    server.listen(i);
                    server.close();
                    port = i;
                    break;
                }
                catch(e)    {
                    ;
                }
            }
        }
        console.log('port', port);
        return  (port);
    }
    run()   {
        const ws = new WebSocketServer({
            port: this.ws_port
        });
        ws.on('connection', (socket) => {
            let session = new Session(socket);
            let user;
            socket.on('message', (message) => {
                let recv = TunnelConnection.decodeMessage(message);
                //console.log({recv});
                if  ( recv.channel == 0 )   {
                    let body = JSON.parse(recv.body);
                    console.log({body});
                    switch  ( body.method ) {
                      case    'auth':
                        console.log('auth');
                        user = do_auth(session, body);
                        session.set_user(user);
                        break;
                      case  'profiles':
                        break;
                      case  'start':
                        console.log('start');
                        let profile_name;
                        if  ( body.body )   {
                            profile_name = body.body.name;
                        }
                        let profile = getProfile(user.name, profile_name);
                        if  ( profile ) {
                            let port = this.searchFreePort();
                            session.start(port, profile);
                            do_start(this.proxy, session, body);
                            session.sendControl({
                                status: 'OK',
                                message_id: body.message_id
                            });
                        } else {
                            session.sendControl({
                                status: 'NG',
                                message_id: body.message_id,
                                error: 'profile not found'
                            });
                        }
                        break;
                    }
                } else {
                    console.log('recv', recv.channel);
                    let local = session.channels[recv.channel];
                    local.write(recv.body);
                }
            });
            socket.on('close', () => {
                session.close(this.proxy);
            });
        })
    }
}

