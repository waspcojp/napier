//
//  このコードはあくまでもスタブのようなものです
//
const models = require('../models');
const {auth_user} = require('../libs/user');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const   findUser = (user_name) => {
    let user;
    for ( let i = 0 ; i < USER.length ; i += 1 )    {
        if  ( USER[i].name == user_name )    {
            user = USER[i];
            break;
        }
    }
    return  (user);
}
const   getProfile = (user, profile_name) => {
    let profile;

    if  ( user )    {
        if  ( !profile_name )   {
            profile = Object({
                name: 'default',
                path: `10.1.254.11/${user.name}`
            });
        } else {
            for ( let i = 0 ; i < user.profiles.length ; i += 1 )   {
                if  ( user.profiles[i].name == profile_name )   {
                    profile = user.profiles[i];
                    break;
                }
            }
        }
    }
    return  (profile);
}

const   delProfile = (user, profile_name) => {
    return  new Promise((done, fail) => {
        if  ( user )    {
            for ( let i = 0; i < user.profiles.length ; i += 1) {
                if  ( user.profiles[i].name == profile_name )   {
                    let profile = user.profiles[i];
                    user.profiles.splice(i, 1);
                    profile.destroy().then(() => {
                        done(true);
                    })
                    break;
                }
            }
        } else {
            fail()
        }
    });
}

const   validateProfile = (user, profile)  => {
    return  (true);
}

const   putProfile = (user, arg) => {
    return  new Promise((done, fail) => {
        let find;
        let ok;
        if  ( user )    {
            let profile = new models.Profile();
            profile.userId = user.id;
            profile.name = arg.name;
            profile.path = arg.path;
            if ( arg.ssl )  {
                profile.ssl = true;
                profile.key = arg.key;
                profile.cert = arg.cert;
                profile.ca = arg.ca;
            } else {
                profile.ssl = false;
            }

            if  ( validateProfile(user, profile) )  {
                for ( let i = 0; i < user.profiles.length; i += 1 ) {
                    if  ( user.profiles[i].name == profile.name )   {
                        find = i;
                        break;
                    }
                }
                profile.save().then(() => {
                    if  ( find )    {
                        user.profiles[find] = profile;
                        ok = find;
                    } else {
                        user.profiles.push(profile);
                        ok = user.profiles.length - 1;
                    }
                    done(ok);
                });
            }
        } else {
            fail(false);
        }
    });
}

const   passwd = (user, old_pass, new_pass) => {
    console.log('passwd', user.name, old_pass, new_pass);
    return new Promise((done, fail) => {
        console.log('passwd');
        auth_user(user.name, old_pass).then((user) => {
            user.hash_password = bcrypt.hashSync(new_pass, SALT_ROUNDS);
            console.log('**', user)
            user.save().then(() => {
                console.log('***')
                done(true);
            }).catch(() => {
                done(false);
            });
        }).catch (() => {
            done(false);
        });
    });
}

module.exports = {
    auth: auth_user,
    passwd: passwd,
    getProfile: getProfile,
    delProfile: delProfile,
    putProfile: putProfile
};