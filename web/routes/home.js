const express = require('express');
const router = express.Router();
const passport = require('passport');
const Local = require('passport-local').Strategy;
const {auth_user, is_authenticated, User} = require('../../libs/user');
const models = require('../../models');
const Op = models.Sequelize.Op;

passport.use(new Local(
	{
		usernameField: 'user_name',
		passwordField: 'password',
		passReqToCallback: true,
		session: true,
	}, (req, user_name, password, done) => {
		//console.log('user_name', user_name);
		//console.log('password', password);
		//console.log('done', done);

		process.nextTick(() => {
			auth_user(user_name, password).then(() => {
				return done(null, {
					user_name: user_name
				});
			}).catch(() => {
				console.log('login error');
				return done(null, false, {
					message: 'fail'
				});
			});
		});
	}));

passport.serializeUser((user, done) => {
	//console.log('serialize:', user);
	done(null, user);
});

passport.deserializeUser((user, done) => {
	//console.log('deserialize:', user);
	done(null, user);
});

/* GET users listing. */
router.get('/login', (req, res, next) => {
	res.render('login', { title: 'Login',
						  msg_type: '',
						  message: '',
						});
});

router.post('/login', (req, res, next) => {
	//console.log(req.body.user_name);
	//console.log(req.body.password);

	passport.authenticate('local', (error, user, info) => {
		//console.log('error', error);
		//console.log('user', user);
		//console.log('info', info);
		if (error) {
			return next(error);
		}
		if ( !user ) {
			//console.log('user not found');
			res.render('login', { title: 'Login',
								  msg_type: 'danger',
								  message: `user ${user.user_name} not found`
								});
		} else {
			req.login(user, (error, next) => {
				//console.log('user', user);
				//console.log("error", error);
				if (error) {
					//console.log("error");
					res.render('login', { title: 'Login',
										  msg_type: 'danger',
										  message: `user ${user.user_name} not found`
										});
				} else {
					res.redirect('home');
				}
			});
		}
	})(req, res, next);
});

router.get('/logout', (req, res, next) => {
	//console.log('logout', req.user);
	req.session.destroy();
	//req.logout();
	res.redirect('/manage/login');
});

router.get('/signup', (req, res, next) => {
	res.render('signup', { title: 'Signup',
						   msg_type: '',
						   message: ''
						});
});

router.post('/signup', (req, res, next) => {
	//console.log(req.body.user_name);
	//console.log(req.body.password);

	user_name = req.body.user_name;
	password = req.body.password;
	if ( !User.check(user_name) ) {
		user = new User(user_name, {
			name: user_name
		})
		user.password = password;
		user.create().then((ret) => {
			//console.log('created', ret);
			//console.log(`user ${user_name} created`);
			res.redirect('login');
		});
		//console.log('signup_post fine');
	} else {
		//console.log('user duplicate', user_name);
		res.render('signup', { msg_type: 'danger',
							   message: `user ${user_name} duplicated`
							 });
	}
});

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

router.get('/:base', is_authenticated, index);
router.get('/', is_authenticated, index);

module.exports = router;
