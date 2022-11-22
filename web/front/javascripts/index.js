import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import axios from 'axios';

import Index from '../svelte/index.svelte';

let target = document.getElementById('home');
let user = target.getAttribute('user');

const getProfiles = ()  => {
    return new Promise ((resolve, reject) => {
        axios.get('/manage/api/profiles').then((ret) => {
            console.log('ret.data', ret.data);
            if  ( ret.data.result == 'OK' ) {
                resolve(ret.data);
            } else {
                reject();
            }
        });
    });
}
const updateProfile = (profile) => {
    return new Promise((resolve, reject) => {
        try {
            let pr;
		    if ( profile.id  ) {
			    pr = axios.put('/manage/api/profile', profile);
		    } else {
			    pr = axios.post('/manage/api/profile', profile);
		    }
            pr.then((res) => {
                if  ( res.data.result == 'OK' ) {
                    resolve();
                } else {
                    reject(res.data.message);
                }
            }).catch((e) => {
                console.log(e);
                reject('other error');
            })
        } catch(e) {
            console.log(e);
            reject('connection error');
        }
    });
}
const deleteProfile = (profile_id) => {
    return new Promise((resolve, reject) => {
        try {
		    axios.delete('/manage/api/profile', {
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

const login = (user_name, password) => {
    return new Promise ((resolve, reject) => {
        axios.post('/manage/api/login', {
            user_name: user_name,
            password: password
        }).then((ret) => {
            if  ( ret.data.result == 'OK' ) {
                resolve();
            } else {
                reject(ret.data.message);
            }
        }).catch((e) => {
            console.log(e);
            reject('other error');
        });
    });
}
const logout = () => {
    return new Promise ((resolv, reject) => {
        axios.post('/manage/api/logout').then((ret) => {
            resolv();
        });
    }).catch ((e) => {
        reject();
    });
}
const signup = (user_name, password) => {
    return new Promise ((resolve, reject) => {
        axios.post('/manage/api/signup', {
            user_name: user_name,
            password: password
        }).then((ret) => {
            if  ( ret.data.result == 'OK' )  {
                resolve();
            } else {
                reject(ret.data.message);
            }
        }).catch((e) => {
            console.log(e);
            reject('other error');
        });
    });
}

const password = (old_pass, new_pass) => {
    return new Promise((resolve, reject) => {
        try {
            axios.put('/manage/api/password', {
                currentPassword: old_pass,
                newPassword: new_pass 
            }).then((res) => {
                if  ( res.data.result == 'OK' )    {
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

const api = {
    getProfiles: getProfiles,
    updateProfile: updateProfile,
    deleteProfile: deleteProfile,
    login: login,
    logout: logout,
    signup: signup,
    password: password
}
const index = new Index({
    target: target,
    props: {
        user: user,
        api: api
    }
});

export default index;
