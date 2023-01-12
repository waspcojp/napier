const { contextBridge, ipcRenderer } = require('electron')
let env;

const login = (user_name, password) => {
    return new Promise ((resolve, reject) => {
        ipcRenderer.invoke('user:login', {
            user_name: user_name,
            password: password
        }).then((res) => {
            //console.log('res', res);
            if  ( res.result == 'OK' ) {
                env.user = user_name;
                resolve();
                console.log('env', env);
            } else {
                env.user = undefined;
                reject(res.message);
            }
        }).catch((e) => {
            console.log(e);
            env.user = undefined;
            reject('other error');
        });
    });
}
const logout = () => {
    return new Promise ((resolv, reject) => {
        ipcRenderer.invoke('user:logout').then((res) => {
            console.log('preload.js logout', res);
            resolv();
        }).catch ((e) => {
            console.log('preload.js logout reject');
            reject();
        });
    });
}
const signup = (user_name, password) => {
    return new Promise ((resolve, reject) => {
        ipcRenderer.invoke('user:signup', {
            user_name: user_name,
            password: password
        }).then((res) => {
            console.log('res(preload.js)', res);
            if  ( res.result == 'OK' )  {
                resolve();
            } else {
                reject(res.message);
            }
        }).catch((e) => {
            console.log(e);
            reject('other error(preload.js)');
        });
    });
}

const password = (old_pass, new_pass) => {
    return new Promise((resolve, reject) => {
        try {
            ipcRenderer.invoke('user:password', {
                currentPassword: old_pass,
                newPassword: new_pass 
            }).then((res) => {
                if  ( res.result == 'OK' )    {
                    resolve();
                } else {
                    reject();
                }
            }).catch((e) => {
                reject();
            });
        } catch (e) {
            reject();
        }
    });
}
const getProfiles = ()  => {
    return new Promise ((resolve, reject) => {
        ipcRenderer.invoke('profiles').then((res) => {
            console.log('res', res);
            if  ( res.result == 'OK' ) {
                resolve(res);
            } else {
                reject();
            }
        });
    });
}

const updateProfile = (profile) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.invoke('profile:update', {
            profile: profile
        }).then((res) => {
            if  ( res.result == 'OK' )    {
                resolve();
            } else {
                reject(res.message);
            }
        }).catch((e) => {
            console.log(e);
            reject('other error');
        });
    });
}
const deleteProfile = (profile_id) => {
    return new Promise((resolve, reject) => {
		ipcRenderer.invoke('profile:delete', {
            profile_id: profile_id
        }).then((res) => {
			resolve();
		}).catch((e) => {
		    console.log(e);
            reject(e);
		    // can't delete
		    //	TODO alert
	    });
    });
}

const setConf = (conf) => {
    return new Promise((resolve, reject) => {
        if  ( conf )    {
            if  ( conf.host )   {
                env.host = conf.host;
            }
            if  ( conf.port )   {
                env.port = conf.port;
            }
            if  ( conf.user )   {
                env.user = conf.user;
            }
            if  ( conf.password )   {
                env.password = conf.password;
            }
            if  ( conf.profiles )   {
                env.profiles = conf.profiles;
            }
            ipcRenderer.invoke('env:set', env).then((res) => {
                resolve(env);
            });
        } else {
            ipcRenderer.invoke('env:set').then((res) => {
                resolve(env);
            });
        }
    })
};
const getConf = () => {
    return new Promise((resolve, reject) => {
        ipcRenderer.invoke('env:get').then((res) => {
            env = res;
            resolve(res);
        })
    })
}

const startProxy = (profile_name, port) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.invoke('proxy:start', {
            profile: profile_name,
            localPort: port
        }).then((res) => {
            resolve(res.data);
        });
    });
}
const stopProxy = (profile) => {
    return new Promise((resolve, reject) => {
        ipcRenderer.invoke('proxy:stop', {
            profile: profile
        }).then((res) => {
            resolve(res.data);
        });
    });
}

const init = () => {
    //console.log('env', env);
    getConf().then((_env) => {
        env = _env;
        if  (( env.user ) &&
             ( env.password ) ) {
            login(env.user, env.password);
        }
        contextBridge.exposeInMainWorld('env', env);
        contextBridge.exposeInMainWorld('api', {
            login: login,
            logout: logout,
            signup: signup,
            password: password,
            getProfiles: getProfiles,
            updateProfile: updateProfile,
            deleteProfile: deleteProfile,
            setConf: setConf,
            getConf: getConf,
            startProxy: startProxy,
            stopProxy: stopProxy
        });
    });
}

init();
