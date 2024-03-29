const {WebSocketServer} = require('ws');
const {MY_DOMAIN, cert_path} = require('../config/server.js');
const TunnelConnection = require('./tunnel-connection');
const {auth, getProfile, getProfiles, delProfile, putProfile, passwd} = require('./user');
const Session = require('./session');
const net = require('net');
const fs = require('fs');
const https = require('https');

const   do_auth = (session, message_id, user_name, password, body) => {
    return new Promise((done, fail) => {
        auth(user_name, password).then((user) => {
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
        for ( let i = this.port_range[0] ; i <= this.port_range[1] ; )    {
            if  ( !this.proxyPort[i - this.port_range[0]] )   {
                this.proxyPort[i - this.port_range[0]] = i;
                let server = net.createServer();
				try {
					server.listen(i);
                    port = server.address().port;
                    server.close();
                    return  (port);
				} catch(e) {
					this.proxyPort[i - this.port_range[0]] = undefined;
					console.log('error', i, e);
                }
            }
            i += 1;
        }
        console.log('free port not found');
        return  (port);
    }
    command(session, body, arg)  {
        switch  ( body.method ) {
          case  'ping':
            {
                let message_id = body.message_id;
                session.sendControl(message_id, {
                    at: new Date(),
                    message_id: body.message_id
                });
            }
            break;
          case    'auth':
            {
                let message_id = body.message_id;
                do_auth(session, message_id, arg.user, arg.password, body).then((user) => {
                    session.set_user(user);
                }).catch(() => {
                });
            }
            break;
          case  'start':
            {
                let message_id = body.message_id;
                let profile_name = arg.name;
                getProfile(session.user, profile_name).then((profile) => {
                    let port;
                    if  ( profile.path.match(/^\d+$/) ) {
                        port = parseInt(profile.path);
                    } else {
                        port = this.searchFreePort();
                    }
                    do_start(this.proxy, session, port, profile, body);
                    session.sendReturn(message_id, true, 'OK');
                })
                .catch((e) => {
                    console.log(e);
                    session.sendControl(message_id, {
                        status: 'NG',
                        message_id: body.message_id,
                        error: 'profile not found'
                    });
                });
            }
            break;
          case    'stop':
            {
                session.close(this.ptoxy);
            }
            break;
        }
    }
    run()   {
        let ws;
        if  ( cert_path )   {
            let server = https.createServer({
                cert: fs.readFileSync(`${cert_path}/${MY_DOMAIN}-cert.pem`),
                key: fs.readFileSync(`${cert_path}/${MY_DOMAIN}.pem`)
            }).listen(this.ws_port);
            ws = new WebSocketServer({server: server});
        } else {
            ws = new WebSocketServer({
                port: this.ws_port
            });
        }
        ws.on('connection', (socket) => {
            let session = new Session(socket);
            socket.on('message', (message) => {
                let recv = TunnelConnection.decodeMessage(message);
                if  ( recv.channel == 0 )   {
                    let body;
                    let arg;
                    if  ( recv.body )   {
                        body = JSON.parse(recv.body);
                        arg = body.body;
                    }
                    this.command(session, body, arg);
                } else {
                    let local = session.channels[recv.channel];
                    if  ( local )   {
                        try {
                            local.write(recv.body);
                            let size = recv.body.length - 1;
                            if  ( size > 0 )    {
                                session.send += size;
                            }
                        } catch (e) {
                            console.log('closed socket', e);
                        }
                    }
                }
            });
            socket.on('close', () => {
				this.proxyPort[session.localPort - this.port_range[0]] = undefined;
                session.close(this.proxy);
            });
        });
        ws.on('error', (e) => {
            console.log('ws error', e);
            session.close(this.proxy);
        })
        ws.on('close', () => {
            session.close(this.proxy);
        })
    }
}

