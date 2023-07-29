const program = require('commander');   //  https://github.com/tj/commander.js
const {clientOpen, Api} = require('./index');
const fs = require('fs');
const startWebServer = require('../libs/web-server').start;
const _axios = require('axios');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const jar = new CookieJar();
const axios = wrapper(_axios.create({ jar }));


const LOCAL_PORT = 4000;

const   parseOptions = () => {
    program.option  ('--config <config filename>', 'config file');
    program.option  ('--user <user>',              'user name');
    program.option  ("--password <password>",              "password");
    program.option  ('--url <URL>',                'server URL');
    program.option  ('--local-port <localPort>',   'local port');
    program.option  ('--re-connect',               're-connect server');
    program.option  ('--web-server',               'start web server');
    program.option  ('--server-config <config filename>', 'web server config file');
    program.option  ('--document-root <path>',     'web server document root');
    program.option  ('--index',                    'list index');
    program.option  ('--markdown',                 'markdown SSR');
    program.option  ('--authenticate',             'password authentication');

    program.argument('[profileName]',              'profile name', 'default');
    program.parse();

    let opts = program.opts();
    let args = program.args;

    //console.log({opts}, args);
    if  ( opts.config ) {
        try {
            let config = JSON.parse(fs.readFileSync(opts.config, 'utf-8'));
            Object.keys(opts).forEach((key) => {
                    //console.log('key', key, opts[key]);
                    config[key] = opts[key];
            });
            if  ( config['profile'] )   {
                profile = config['profile'];
            }
            opts = config;
        } catch (e) {}
    }
    opts['localPort'] ||= LOCAL_PORT;
    opts['reConnect'] ||= false;
    opts['webServer'] ||= false;
    opts['index'] ||= false;
    opts['authenticate'] ||= false;
    console.log({opts}, args);

    return  { opts: opts, profile: args[0]};
}

let closed = true;
const   tunnel = (opts, ws_url, profile) => {
    closed = false;
    //console.log('main');
    let ws = clientOpen(opts.localPort, ws_url);
    ws.on('open', () => {
        ws.Api('auth', {
                user: opts.user,
                password:  opts.password
            },
            (body) => {
                console.log('body', body);
                if  (( body ) &&
                     ( body.status == 'OK' ))  {
                    session_id = body.id;
                    ws.Api('start', {
                            name: profile
                        },
                        (body) => {
                            if  ( !body || body.status != 'OK')  {
                                console.log(`can not start ${profile}`);
                                console.log('error:', body.error);
                                ws.close();
                            } else {
                                console.log(`start ${profile}`);
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

const makeConnection = (opts, profile) => {
    let serverSpecs;

    axios.post(`${opts.url}/manage/api/login`, {
        user_name: opts.user,
        password:  opts.password
    }).then((res) => {
        if  ( res.data.result === 'OK' )    {
            serverSpecs = res.data.specs;
            axios.get(`${opts.url}/manage/api/proxy`).then((res) => {
                //console.log(res.data);
                if  ( res.data.result === 'OK' )    {
                    tunnel(opts, res.data.url, profile);
                } else {
                    console.log('ready fail');
                }
            }).catch((e) => {
                console.log('proxy network error',e);
            })
        } else {
            console.log('login fail', res.data.message);
        }
    }).catch ((e) => {
        console.log('login connection refused', e);
    })
}

const   main = () => {
    let {opts, profile} = parseOptions();
    if  ( opts.webServer )  {
        let config = {};
        if  ( opts.serverConfig )   {
            config = JSON.parse(fs.readFileSync(opts.serverConfig, 'utf-8'));
            opts.documentRoot ||= config['public'];
        } else {
            config['directoryListing'] = opts.index;
            config['markdown'] = opts.markdown;
            config['authenticate'] = opts.authenticate;
        }
        startWebServer(opts.localPort, opts.documentRoot, config);
    }
    if  ( opts.url )    {
        if  ( opts.reConnect )  {
            setInterval(() => {
                if  ( closed )  {
                    try {
                        makeConnection(opts, profile);
                    } catch (e) {
                        console.log('error', e);
                    }
                }
            }, 1000 * 5);
        } else {
            makeConnection(opts, profile);
        }
    }
}

main();
