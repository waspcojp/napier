const {WebSocketServer} = require('ws');
const TunnelConnection = require('./tunnel-connection');
const {auth, getProfile, getProfiles, delProfile, putProfile, passwd} = require('./user');
const Session = require('./session');
const net = require('net');

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


const   do_start = (proxy, session, port, profile, body) => {
    session.start(port, profile);
    session.openLocal();
    if  ( !profile.path.match(/^\d+/) ) {
        session.register(proxy);
    }
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
    command(session, body, arg)  {
        console.log({body});
        switch  ( body.method ) {
          case  'ping':
            {
                let message_id = body.message_id;
                console.log('ping');
                session.sendControl(message_id, {
                    at: new Date(),
                    message_id: body.message_id
                });
            }
            break;
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
                    console.log('start', profile.name);
                    let port;
                    if  ( profile.path.match(/^\d+$/) ) {
                        port = parseInt(profile.path);
                    } else {
                        port = this.searchFreePort();
                    }
                    do_start(this.proxy, session, port, profile, body);
                    session.sendReturn(message_id, true, 'OK');
                })
                .catch(() => {
                    session.sendControl(message_id, {
                        status: 'NG',
                        message_id: body.message_id,
                        error: 'profile not found'
                    });
                });
            }
            break;
        }
    }
    run()   {
        if  ( cert_path )   {
            const ws = new WebSocketServer({
                port: this.ws_port,
                cert: fileReadSync(`${cert_path}/${MY_DOMAIN}-cert.pem`),
                key: fileReadSync(`${cert_path}/${MY_COMAIN}.pem`)
            });
        } else {
            const ws = new WebSocketServer({
                port: this.ws_port
            });
        }
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
                    this.command(session, body, arg);
                } else {
                    //console.log('recv', recv.channel);
                    let local = session.channels[recv.channel];
                    if  ( local )   {
                        local.write(recv.body);
                        let size = recv.body.length - 1;
                        if  ( size > 0 )    {
                            session.send += size;
                        }
                    } else {
                        //console.log('no channel', recv.channel);
                    }
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

