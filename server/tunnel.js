const {WebSocketServer} = require('ws');
const new_id = require('../libs/id');
const TunnelConnection = require('./tunnel-connection');
const {auth, getProfile, getProfiles, delProfile, putProfile, passwd} = require('./user');
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
    sendControl(message_id, body)   {
        console.log('sendControl', message_id);
        body.message_id = message_id;
        this.tunnel.sendControl(body);
    }
    sendReturn(message_id, rc, true_status, false_status) {
        if  ( rc )   {
            if  ( typeof true_status === 'string' ) {
                this.sendControl(message_id, {
                    status: true_status
                });
            } else {
                this.sendControl(message_id, true_status);
            }
        } else {
            if  ( typeof false_status === 'string' ) {
                this.sendControl(message_id, {
                    status: false_status
                });
            } else {
                this.sendControl(message_id, false_status);
            }
        }
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
            if  ( this.localServer )    {
                this.localServer.close();
            }
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

const   do_auth = (session, message_id, user_name, password, body) => {
    console.log('auth', body);
    return new Promise((done, fail) => {
        auth(user_name, password).then((user) => {
            console.log({user});
            console.log('message_id', message_id);
            session.sendControl(message_id, {
                status: 'OK'
            });
            done(user);
        }).catch(() => {
            session.sendControl(message_id, {
                status: 'NG'
            });
            fail();
        });
    });
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
            socket.on('message', (message) => {
                let recv = TunnelConnection.decodeMessage(message);
                //console.log({recv});
                if  ( recv.channel == 0 )   {
                    let body;
                    let arg;
                    if  ( recv.body )   {
                        body = JSON.parse(recv.body);
                        arg = body.body;
                    }
                    console.log({body});
                    switch  ( body.method ) {
                      case    'auth':
                        {
                            let message_id = body.message_id;
                            console.log('auth');
                            do_auth(session, message_id, arg.user, arg.password, body).then((user) => {
                                console.log({user});
                                session.set_user(user);
                            }).catch(() => {
                            });
                        }
                        break;
                      case  'passwd':
                        {
                            let message_id = body.message_id;
                            passwd(session.user, arg.old, arg.new).then((flag) => {
                                console.log({flag});
                                session.sendReturn(message_id, flag, 'OK', 'NG');
                            });
                        }
                        break;
                      case  'profiles':
                        {
                            let message_id = body.message_id;
                            console.log('profiles');
                            getProfiles(session.user).then((profiles) => {
                                session.sendControl(message_id, {
                                    profiles: profiles
                                });
                            });
                        }
                        break;
                      case  'del_profile':
                        {
                            let message_id = body.message_id;
                            console.log('del_profile', arg.name);
                            delProfile(session.user, arg.name).then((flag) => {
                                session.sendReturn(message_id, flag, 'OK', 'NG');
                            }).catch(() => {
                                session.sendReturn(message_id, true, 'NG');
                            });
                        }
                        break;
                      case  'put_profile':
                        {
                            let message_id = body.message_id;
                            console.log('put_profile', arg);
                            putProfile(session.user, arg).then((flag) => {
                                session.sendReturn(message_id, flag, 'OK', 'NG');
                            }).catch(() => {
                                session.sendReturn(message_id, true, 'NG');
                            });
                        }
                        break;
                      case  'start':
                        {
                            let message_id = body.message_id;
                            console.log('start');
                            let profile_name = arg.name;
                            getProfile(session.user, profile_name).then((profile) => {
                                let port = this.searchFreePort();
                                session.start(port, profile);
                                do_start(this.proxy, session, body);
                                session.sendReturn(message_id, true, 'OK');
                            }).catch(() => {
                                session.sendControl(message_id, true, {
                                    status: 'NG',
                                    message_id: body.message_id,
                                    error: 'profile not found'
                                });
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
        });
        ws.on('close', () => {
            session.close(this.proxy);
        })
    }
}

