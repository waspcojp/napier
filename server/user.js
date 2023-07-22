const models = require('../models');
const {MY_DOMAIN, makeDefaultPath} = require('../config/server.js');
const Op = models.Sequelize.Op;
const {auth_user} = require('../libs/user');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const   getProfiles = (user) => {
    return  models.Profile.findAll({
            where: {
                userId: user.id
            }
        });
}

const   getProfile = (user, profile_name) => {
    let profile;

    if  ( user )    {
        if  (   ( !profile_name )
            ||  ( profile_name == 'default' ))   {
            return  new Promise((done, fail) => {
                let profile = Object({
                    name: 'default',
                    path: makeDefaultPath(MY_DOMAIN, user)
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
    } else {
        return  new Promise((done, fail) => {
            console.log('user not found')
            fail();
        });
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
                //console.log('delProfile', profile);
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
    //console.log('passwd', user.name, old_pass, new_pass);
    return new Promise((done, fail) => {
        auth_user(user.name, old_pass).then((user) => {
            user.hash_password = bcrypt.hashSync(new_pass, SALT_ROUNDS);
            user.save().then(() => {
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