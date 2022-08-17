const program = require('commander');   //  https://github.com/tj/commander.js
const {clientOpen, Api} = require('./index');

const LOCAL_PORT = 4000;
const HOST = 'localhost';
const PORT = 8001;

const   commandParser = () => {
    program.requiredOption('--user <user>', 'user name');
    program.requiredOption("--pass <pass>", "password");
    program.option        ('--host <host>', 'tunnel host', HOST);
    program.option        ('--port <port>', 'tunnel port', PORT);
    program.option        ('--local-port <localPort>', 'local port', LOCAL_PORT);
    program.argument      ('[profileName]', 'profile name', 'default');
    program.parse();
    return  program;
}
const   cli = () => {
    let program = commandParser();
    let opts = program.opts();
    let args = program.args;
    //console.log({opts});
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
}
cli();
