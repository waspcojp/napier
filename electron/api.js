const proxy = require('./proxy');
const _axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const qs = require('querystring');
const fs = require('fs');
const ENV_FILE_NAME = '.napier';

const jar = new CookieJar();

let axios = wrapper(_axios.create({ jar }));

let env;
let profiles;

const init = () => {
    try {
        env = JSON.parse(fs.readFileSync(ENV_FILE_NAME, 'utf-8'));
    } catch (e) {
        env = {
            host: 'www.napier-net.com',
            port: 8001,
            localPort: 4000,
            profiles: {}
        };
    }
    console.log('init', env);
}

const login = (ev, args) => {
    //console.log('args', args);
    let user_name = args.user_name;
    let password = args.password;
    return new Promise ((resolve, reject) => {
        axios.post(`${env.host}/manage/api/login`, {
            user_name: user_name,
            password: password
        }).then((res) => {
            //console.log('login', res.headers);
            resolve(res.data);
        }).catch((e) => {
            reject({
                result: 'NG',
                message: 'other error'
            });
        });
    });
}

const logout = (ev, args) => {
    //console.log('api.js logout', args)
    return new Promise ((resolv) => {
        axios.post(`${env.host}/manage/api/logout`).then((ret) => {
            resolv();
        }).catch ((e) => {
            console.log('reject', e);
        });
    });
}

const signup = (ev, args) => {
	let user_name = args.user_name;
	let password = args.password;
    return new Promise ((resolve, reject) => {
        axios.post(`${env.host}/manage/api/signup`, {
            user_name: user_name,
            password: password
        }).then((res) => {
            resolve(res.data);
        }).catch((e) => {
            console.log('api.js', e);
            reject({
                result: 'NG',
                message: 'other error(api.js)'
            });
        });
    });
}

const password = (ev, args) => {
    let old_pass = args.currentPassword;
    let new_pass = args.newPassword;
    return new Promise((resolve, reject) => {
        try {
            axios.put(`${env.host}/manage/api/password`, qs.stringify({
                currentPassword: old_pass,
                newPassword: new_pass 
            })).then((res) => {
                resolve(res.data);
            }).catch((e) => {
                console.log(e);
                reject({
                    result: 'NG',
                    message: 'other error(api.js)'
                });
            });
        } catch (e) {
            reject({
                result: 'NG',
                message: 'other error(catch)'
            });
        }
    });
}

const getProfiles = (ev, args)  => {
    return new Promise ((resolve, reject) => {
        axios.get(`${env.host}/manage/api/profiles`).then((res) => {
            //console.log('ret.data', ret.data);
            if  ( res.data.result == 'OK' ) {
                profiles = res.data.profiles;
                //console.log('profiles', profiles);
                for ( profile of profiles ) {
                    if  ( !env.profiles[profile.name] ) {
                        profile.localPort = env.localPort;
                    } else {
                        profile.localPort = env.profiles[profile.name].localPort;
                    }
                }
                //console.log('profiles', env.profiles);
                resolve(res.data);
            } else {
                reject();
            }
        });
    });
}
const updateProfile = (ev, args) => {
    let profile = args.profile;
    return new Promise((resolve, reject) => {
        try {
            let pr;
            if  ( profile.localPort )   {
                env.profiles[profile.name] = {
                    localPort: profile.localPort
                };
                delete profile.localPort;
            }
		    if ( profile.id  ) {
			    pr = axios.put(`${env.host}/manage/api/profile`, profile);
		    } else {
			    pr = axios.post(`${env.host}/manage/api/profile`, profile);
		    }
            pr.then((res) => {
                resolve(res.data);
            }).catch((e) => {
                console.log(e);
                reject();
            })
        } catch(e) {
            console.log(e);
            reject();
        }
    });
}

const deleteProfile = (ev, args) => {
    let profile_id = args.profile_id;
    return new Promise((resolve, reject) => {
        try {
		    axios.delete(`${env.host}/manage/api/profile`, {
			    data: {
				    id: profile_id
			    }
		    }).then((result) => {
			    resolve();
		    });
	    } catch(e) {
		    console.log(e);
            reject();
		    // can't delete
		    //	TODO alert
	    }
    });
}

const setConf = (ev, args) => {
    return new Promise ((resolve, reject) => {
        console.log('setConf', args, env);
        if ( args ) {
            env = args;
        }
        let _env = {
            host: env.host,
            port: env.port,
            user: env.user,
            password: env.password,
            localPort: env.localPort,
            profiles: {}
        }
        Object.keys(env.profiles).forEach((key) => {
            _env.profiles[key] = {
                localPort: env.profiles[key].localPort
            };
        });

        console.log('_env', env);
        console.log(JSON.stringify(_env, null, ' '));
        fs.writeFileSync(ENV_FILE_NAME, JSON.stringify(_env, null, ' '));
        resolve();
    });
}
const getConf = (ev, args) => {
    return new Promise ((resolve, reject) => {
        console.log('getConf', args);
        resolve(env);
    });
}

const startProxy = (ev, args) => {
    let profile_name = args.profile;
    let localPort = args.localPort;
    console.log('api.js', profile_name, localPort);

    return new Promise((resolve, reject) => {
        proxy.start(env, profile_name, localPort);
        resolve(profile);
    });
}

const stopProxy = (ev, args) => {
    let profile_name = args.profile;
    console.log('api.js', profile);

    return new Promise((resolve, reject) => {
        proxy.stop(env, profile_name);
        resolve(profile_name);
    });
}

init();
module.exports = {
    login: login,
    logout: logout,
    signup: signup,
    getConf: getConf,
    setConf: setConf,
    getProfiles: getProfiles,
    updateProfile: updateProfile,
    deleteProfile: deleteProfile,
    password: password,
    startProxy: startProxy,
    stopProxy: stopProxy
};
