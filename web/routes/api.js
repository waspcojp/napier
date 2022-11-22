const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User, Passport} = require('../../libs/user');
const {passwd} = require('../../server/user');
const {Profile} = require('../../models');

router.put('/password', is_authenticated, (req, res, next) => {
    let body = req.body;
    console.log({body});
    let user_name = User.current(req);
    passwd({name: user_name}, body.currentPassword, body.newPassword).then((flag) => {
        res.json({
            result: flag ? 'OK' : 'NG'
        });
    })
});

router.post('/login', (req, res, next) => {
	Passport.authenticate('local', (error, user, info) => {
		if (error) {
			return next(error);
        }
        if  ( !user )   {
            res.json({
                result: 'NG',
                message: `user ${user_name} not found`
            });
        } else {
			req.login(user, (error, next) => {
                if  ( error )   {
                    console.log('error');
                    res.json({
                        result: 'NG',
                        message: `user ${user_name} not found`
                    });
                } else {
                    res.json({
                        result: 'OK'
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
	user_name = req.body.user_name;
	password = req.body.password;
    User.check(user_name).then((user) => {
        if  ( user) {
            res.json({
                result: 'NG',
                message: `user ${user_name} duplicated`
            });
        } else {
		    user = new User(user_name, {
			    name: user_name
		    });
		    user.password = password;
		    user.create().then((ret) => {
                res.json({
                    result: 'OK'
                })
		    });
        }
    });
});

router.get('/profiles', is_authenticated, (req, res, next) => {
    User.get(User.current(req)).then((user) => {
        if  ( user )    {
            Profile.findAll({
                where: {
                    userId: user.id
                },
                order: [
                    [ 'name', 'ASC']
                ]
            }).then((profiles) => {
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
        profile.key = body.key;
        profile.cert = body.cert;
        profile.ca = body.ca;
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
