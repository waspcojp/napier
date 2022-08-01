//
//  このコードはあくまでもスタブのようなものです
//
const models = require('../models');
const Op = models.Sequelize.Op;
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

const   getProfiles = (user) => {
    return  models.Profile.findAll({
            userId: user.id
        });
}

const   getProfile = (user, profile_name) => {
    let profile;

    if  ( user )    {
        if  ( !profile_name )   {
            return  new Promise((done, fail) => {
                let profile = Object({
                    name: 'default',
                    path: `10.1.254.11/${user.name}`
                });
                done(profile);
            });
        } else {
            return  models.Profile.findOne({
                where: {
                    [Op.and]: {
                        userId: user.id,
                        name: profile_name
                    }
                }
            })
        }
    }
}

const   delProfile = (user, profile_name) => {
    return  new Promise((done, fail) => {
        if  ( user )    {
            models.Profile.findOne({
                where: {
                    [Op.and]: {
                        userId: user.id,
                        name: profile_name
                    }
                }
            }).then((profile) => {
                console.log('delProfile', profile);
                profile.destroy().then(() => {
                    done(true);
                });
            });
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
                profile.save().then(() => {
                    done(true);
                }).catch(() => {
                    fail(false);
                })
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
    getProfiles: getProfiles,
    getProfile: getProfile,
    delProfile: delProfile,
    putProfile: putProfile
};