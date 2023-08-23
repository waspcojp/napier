const TunnelConnection = require('./tunnel-connection');
const new_id = require('../libs/id');
const fs = require('fs');
const net = require('net');

module.exports = class {
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
        //console.log('start', profile);
        this.localPort = port;
        if  ( profile.name == 'default' )   {
        } else
        if  ( profile.ssl ) {
            if  ( profile.lets )    {
                profile.ssl = {
                    letsencrypt: {
                        email: profile.user.mail,
                        production: true
                    }
                }
            } else
            if  ( profile.key ) {
                profile.ssl = {};
                let fileName = `${global.env.cert_path}/${profile.id}-key.pem`;
                fs.writeFileSync(fileName, profile.key, 'utf-8');
                profile.ssl.key = fileName;
                fileName = `${global.env.cert_path}/${profile.id}-cert.pem`;
                fs.writeFileSync(fileName, profile.cert, 'utf-8');
                profile.ssl.cert = fileName;
                if  ( profile.ca )  {
                    fileName = `${global.env.cert_path}/${profile.id}-ca.pem`;
                    fs.writeFileSync(fileName, profile.ca, 'utf-8');
                    profile.ssl.ca = fileName;
                }
            } else {
                profile.ssl = true;
            }
        }
        //console.log('profile', profile.ssl);
        this.profile = profile;
        this.send = 0;
        this.recv = 0;
        //console.log('profile', this.profile);
    }
    connect(channel)    {
        this.tunnel.connect(channel);
    }
    closeChannel(channel)  {
        this.tunnel.close(channel);
        if  (( this.send > 0 ) || ( this.recv > 0)) {
            console.log(`{user: ${this.user.id}, profile: ${this.profile.id}, send: ${this.send}, recv: ${this.recv}}`)
        }
        this.send = 0;
        this.recv = 0;
        this.channels[channel] = undefined;
    }
    sendData(channel, buff) {
        let size = buff.length;
        if  ( size > 0 )    {
            this.recv += size;
        }
        this.tunnel.sendData(channel, buff);
    }
    sendControl(message_id, body)   {
        //console.log('sendControl', message_id);
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

    register(proxy) {
        //console.log('ssl', this.profile.ssl);
        let src = this.profile.path;
        let target = `localhost:${this.localPort}/`;

        if  ( this.profile.ssl )    {
            proxy.register(src, target, {
                ssl: this.profile.ssl
            });
        } else {
            proxy.register(src, target);
        }
    }
    close(proxy) {
        //console.log('close', this.localPort);
        if  ( this.profile ) {
            proxy.unregister(this.profile.path);
            if  ( this.localServer )    {
                this.localServer.close();
            }
        }
    }
    openLocal(){
        //console.log('proxyPort', this.localPort);
        let local = net.createServer();
        local.on('connection', (socket) => {
            let channel = this.searchFreeChannel();
            this.channels[channel] = socket;
            this.connect(channel);
            socket.on('data', (buff) => {
                this.sendData(channel, buff);
            });
            socket.on('close', (status) => {
                //console.log('close', channel);
                this.closeChannel(channel);
            })
        });
        this.localServer = local.listen(this.localPort);
    }
}
