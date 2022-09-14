const program = require('commander');   //  https://github.com/tj/commander.js
const {clientOpen, Api} = require('./index');
const fs = require('fs');

const LOCAL_PORT = 4000;
const HOST = 'localhost';
const PORT = 8001;

const   parseOptions = () => {
    program.option        ('--config <config filename>', 'config file');
    program.option('--user <user>', 'user name');
    program.option("--pass <pass>", "password");
    program.option        ('--host <host>', 'tunnel host');
    program.option        ('--port <port>', 'tunnel port');
    program.option        ('--local-port <localPort>', 'local port');
    program.option        ('--re-connect',  're-connect server');
    program.option        ('--web-server',  'start web server');
    program.argument      ('[profileName]', 'profile name', 'default');
    program.parse();

    let opts = program.opts();
    let args = program.args;
    console.log({opts});
    if  ( opts.config ) {
        let config = JSON.parse(fs.readFileSync(opts.config, 'utf-8'));
        Object.keys(config).forEach((key) => {
            if  ( opts[key] != undefined )   {
                console.log('key', key, opts[key]);
                config[key] = opts[key];
            }
        });
        opts = config;
    }
    opts['host'] ||= HOST;
    opts['port'] ||= PORT;
    opts['localPort'] ||= LOCAL_PORT;
    opts['reConnect'] ||= false;
    opts['webServer'] ||= false;
    return  { opts: opts, args: args};
}


let closed = true;
const   tunnel = (opts, args) => {
    closed = false;
    //console.log('main');
    let ws = clientOpen(opts.host, opts.port, opts.localPort);
    ws.on('open', () => {
        ws.Api('auth', {
                user: opts.user,
                password:  opts.pass
            },
            (body) => {
                //console.log('body', body);
                if  ( body.status == 'OK')  {
                    session_id = body.id;
                    ws.Api('start', {
                            name: args[0]
                        },
                        (body) => {
                            if  ( body.status != 'OK')  {
                                console.log(`can not start ${args[0]}`);
                                console.log('error:', body.error);
                                ws.close();
                            } else {
                                console.log(`start ${args[0]}`);
                            }
                        });
                } else {
                    console.log('authentication fail');
                    ws.close();
                }
            });
        });
    ws.on('close', () => {
        //console.log('closed');
        closed = true;
    })
    return  (ws);
}

const   main = () => {
    let {opts, args} = parseOptions();
    console.log({opts});
    if  ( opts.webServer )  {

    }
    if  ( opts.reConnect )  {
        setInterval(() => {
            if  ( closed )  {
                try {
                    tunnel(opts, args);
                } catch (e) {
                    console.log('error', e);
                }
            }
        }, 1000);
    } else {
        tunnel(opts, args);
    }
}

main();
