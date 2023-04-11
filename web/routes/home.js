const express = require('express');
const router = express.Router();
const {User, is_authenticated} = require('../../libs/user');
const service = global.env.service;

const index =  async (req, res, next) => {
	let title;
	switch	( req.params.base )	{
	  case	'':
	  case	'home':
		title = 'Home';
		break;
	  case	'user':
		title = 'User';
		break;
	  default:
		title = '';
		break;
	}
	let user_name = User.current(req);
	if	( user_name )	{
    	User.get(user_name).then((user) => {
			let newProfile;
			if  ( service.paidService )    {
				newProfile = ( user.payLimitAt && user.payLimitAt > new Date()) ? true : false;
			} else {
				newProfile = true;
			}
			res.render('index', {
				title: title,
				msg_type: '',
				message: '',
				user: user_name,
				newProfile: newProfile,
				useWildcardCert: service.useWildcardCert
			});
		}).catch((e) => {
			console.log(e);
			res.render('index', {
				title: title,
				msg_type: '',
				message: '',
				user: null
			});
		});
	} else {
		res.render('index', {
			title: title,
			msg_type: '',
			message: '',
			user: null
		});
	}
}

router.get('/:base', index);
router.get('/', index);

module.exports = router;
