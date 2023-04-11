const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User, Passport} = require('../../libs/user');
const {MY_DOMAIN, makeDefaultPath} = require('../../config/server.js');
const {passwd} = require('../../server/user');
const {Profile} = require('../../models');
const crypto = require('node:crypto');
const NodeRSA = require('node-rsa');
const service = global.env.service;

const password = (req, res, next) => {
    let body = req.body;
    //console.log({req});
    let user_name = User.current(req);
    console.log({user_name});
    passwd({name: user_name}, body.currentPassword, body.newPassword).then((flag) => {
        res.json({
            result: flag ? 'OK' : 'NG'
        });
    })
}

router.put('/password', is_authenticated, password);
router.post('/password', is_authenticated, password);

const payment = (req, res, next) => {
    console.log(req.body);
}
router.post('/payment', payment);

const getUser = (req, res, next) => {
    let user_name = User.current(req);
    User.get(user_name).then((user) => {
        res.json({
            id: user.id,
            user_name: user_name,
            mail: user.mail
        })
    })
}

const putUser = (req, res, next) => {
    let user_name = User.current(req);
    let data = req.body;
    console.log('putUser', user_name, data);
    User.get(user_name).then((user) => {
        user.mail = data.mail;
        user.save().then(() => {
            res.json({
                result: 'OK'
            })
        }).catch((err) => {
            console.log('err', err);
        })
    });
}

router.get('/user', is_authenticated, getUser);
router.put('/user', is_authenticated, putUser);

router.post('/login', (req, res, next) => {
	Passport.authenticate('local', (error, _user, info) => {
        console.log({_user});
		if (error) {
			return next(error);
        }
        if  ( !_user )   {
            res.json({
                result: 'NG',
                message: `user not found`
            });
        } else {
			req.login(_user, (error, next) => {
                if  ( error )   {
                    console.log('error');
                    res.json({
                        result: 'NG',
                        message: `user not found`
                    });
                } else {
                    let newProfile;
                    let user = _user.user;
                    console.log({user}, new Date());
                    if  ( service.paidService )    {
                        newProfile = ( user.payLimitAt && user.payLimitAt > new Date()) ? true : false;
                    } else {
                        newProfile = true;
                    }
                    res.json({
                        result: 'OK',
                        specs: {
                            newProfile: newProfile,
                            useWildcardCert: service.useWildcardCert
                        }
                    });
                }
            });
        }
	})(req, res, next);
});

router.post('/logout', (req, res, next) => {
	req.session.destroy();
	//req.logout();
	res.json();
});

router.post('/signup', (req, res, next) => {
    console.log('signup', req.body);
	let user_name = req.body.user_name;
	let password = req.body.password;
    let mail = req.body.mail;
    User.check(user_name, password, mail).then((user) => {
        if  ( user) {
            res.json({
                result: 'NG',
                message: `user ${user_name} duplicated`
            });
        } else {
		    user = new User(user_name, {
			    name: user_name,
                mail: mail
		    });
		    user.password = password;
		    user.create().then((ret) => {
                res.json({
                    result: 'OK'
                })
		    });
        }
    }).catch((err) => {
        res.json({
            result: 'NG',
            message: err
        });
    });
});

router.get('/profiles', is_authenticated, (req, res, next) => {
    let user_name = User.current(req);
    console.log({user_name});
    User.get(user_name).then((user) => {
        if  ( user )    {
            Profile.findAll({
                where: {
                    userId: user.id
                },
                order: [
                    [ 'name', 'ASC']
                ]
            }).then((profiles) => {
                for ( profile of profiles ) {
                    if  ( profile.cert )    {
                        try {
                            let cert = new crypto.X509Certificate(profile.cert);
                            let subject = cert.subject.split('\n');
                            let issuer = cert.issuer.split('\n');
                            profile.cert =  '*** cert data ***\n' +
                                            `subject: ${subject[0]}\n`;
                            for ( let i = 1 ; i < subject.length ; i ++ )   {
                                profile.cert += `         ${subject[i]}\n`;
                            }
                            profile.cert += `issuer: ${issuer[0]}\n`
                            for ( let i = 1 ; i < issuer.length; i ++ ) {
                                profile.cert += `        ${issuer[i]}\n`;
                            }
                            profile.cert +=  `validFrom: ${cert.validFrom}\n` +
                                            `validTo: ${cert.validTo}`;
                        } catch(e) {
                            console.log('X509 error', e);
                            profile.cert = '** error **';
                        }
                    }
                    if  ( profile.key ) {
                        try  {
                            let key = new NodeRSA(profile.key);
                            profile.key =   '*** private key data ***\n' +
                                            `private: ${key.isPrivate ? 'true' : 'false'}\n` +
                                            `keySize: ${key.getKeySize()}`;
                        } catch(e) {
                            console.log('RSA error', e);
                            profile.key = '** error **';
                        }
                    }
                    if  ( profile.ca )  {
                        profile.ca = '*** CA data here ***';
                    }
                }
                if  ( profiles.length === 0 )   {
                    profiles.push(Object({
                        name: 'default',
                        path: makeDefaultPath(MY_DOMAIN, user)
                    }));
                    console.log(profiles);
                }

                res.json({
                    result: 'OK',
                    profiles: profiles
                });
            });
        } else {
            res.json({
                result: 'NG',
                message: 'user invalud'
            });
        }
    })
});

router.put('/profile', is_authenticated, (req, res, next) => {
    let body = req.body;
    Profile.findOne({
        where: {
            id: body.id
        }
    }).then((profile) => {
        profile.name = body.name;
        profile.path = body.path;
        profile.ssl = body.ssl;
        if  ( body.key )    {
            profile.key = body.key;
        }
        if  ( body.cert )   {
            profile.cert = body.cert;
        }
        if  ( body.ca ) {
            profile.ca = body.ca;
        }
        profile.save().then(() => {
            res.json({
                result: 'OK',
                profile: profile
            });
        }).catch((err) => {
            console.log('err', err);
        })
    })
});
router.post('/profile', is_authenticated, (req, res, next) => {
    let body = req.body;
    User.get(User.current(req)).then((user) => {
        Profile.create({
            name: body.name,
            path: body.path,
            userId: user.id,
            ssl: body.ssl,
            key: body.key,
            cert: body.cert,
            ca: body.ca
        }).then((profile) => {
            res.json({
                result: 'OK',
                profile: profile
            });
        }).catch((err) => {
            console.log('err', err);
        });
    });
})
router.delete('/profile', is_authenticated, (req, res, next) => {
    let body = req.body;
    Profile.findOne({
        where: {
            id: body.id
        }
    }).then((profile) => {
        profile.destroy().then(() => {
            res.json({
                result: 'OK'
            });
        }).catch((err) => {
            console.log('err', err);
        })
    })
})

module.exports = router;
