const express = require('express');
const router = express.Router();
const {auth_user, is_authenticated, User} = require('../../libs/user');
const {passwd} = require('../../server/user');


router.put('/password', is_authenticated, (req, res, next) => {
    let body = req.body;
    console.log({body});
    let user_name = User.current(req);
    passwd({name: user_name}, body.currentPassword, body.newPassword).then((flag) => {
        res.json({
            status: flag ? 'OK' : 'NG'
        });
    })
})

module.exports = router;