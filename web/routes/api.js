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
})

module.exports = router;