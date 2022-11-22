const express = require('express');
const router = express.Router();
const {User} = require('../../libs/user');

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
	res.render('index', {
		title: title,
		msg_type: '',
		message: '',
		user: User.current(req)
	});
};

router.get('/:base', index);
router.get('/', index);

module.exports = router;
