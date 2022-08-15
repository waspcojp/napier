const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User} = require('../../libs/user');
const {passwd} = require('../../server/user');
const {Profile} = require('../../models');

router.put('/password', is_authenticated, (req, res, next) => {
    let body = req.body;
    console.log({body});
    let user_name = User.current(req);
    passwd({name: user_name}, body.currentPassword, body.newPassword).then((flag) => {
        res.json({
            status: flag ? 'OK' : 'NG'
        });
    })
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
                    status: 'OK',
                    profiles: profiles
                });
            });
        } else {
            res.json({
                status: 'NG'
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
                status: 'OK',
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
                status: 'OK',
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
                status: 'OK'
            });
        }).catch((err) => {
            console.log('err', err);
        })
    })
})

module.exports = router;