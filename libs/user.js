const models = require('../models');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

function is_authenticated(req, res, next) {
	//console.log(req.session);

	if ( req.isAuthenticated() ) {
		return (next());
	} else {
		res.redirect('/login');
	}
}

function auth_user(name, password) {
	return new Promise((done, fail) => {
		models.User.findOne({
			where: {
				name: name
			}
		}).then((user) => {
			//console.log(user);
			if ( user ) {
				if  ( bcrypt.compareSync(password, user.hash_password) ) {
					console.log("auth ok");
					this.user = user;
					done(user);
				} else {
					console.log("auth fail");
					fail(user);
				}
			} else {
				console.log("user none");
				fail(null);
			}
		});
	});
}

class User {
	constructor (name, user_info) {
		if ( !user_info ) {
			user_info = {
				name: name
			}
		}
		Object.keys(user_info).forEach((key) => {
			this[key] = user_info[key];
		});
	}
	static current(req) {
		let user;
		if (( req.session ) &&
			( req.session.passport )) {
			user = req.session.passport.user.user_name;
		} else {
			user = null;
		}
		return (user);
	}
	create() {
		return new Promise((done, fail) => {
			models.User.create({
				name: this.name,
				hash_password: this.hash_password
			}).then((user) => {
				console.log(user);
				this.user = user;
				done(user);
			}).catch((err) => {
				console.log(err);
			});
		});
	}
	save()	{
		console.log('save', this.user);
		return new Promise((done, fail) => {
			if	( this.user )	{
				this.user.save().then((user) => {
					console.log(user);
					done(user);
				}).catch((err) => {
					console.log(err);
				});
			}
		});
	}
	set password(p) {
		this.hash_password = bcrypt.hashSync(p, SALT_ROUNDS);
	}
	get password() {
		return (this.hash_password);
	}
	static check(name) {
		models.User.findOne({
			where: {
				name: name },
		}).then((user) => {
			return (user ? true : false);
		});
	}
}

module.exports = {
	is_authenticated: is_authenticated,
	auth_user: auth_user,
	User: User,
};
