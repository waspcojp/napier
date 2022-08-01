'use strict';

const models = require('../models');
const {User} = require('../libs/user');
const fs = require('fs');

const   USER = [
    {
        name: 'ogochan',
        password: '***',
        profiles: [
            {
                name: 'vhost1',
                path: 'shibuya',
                ssl: {
                    key:  "./seeders/10.1.254.12-key.pem",
                    cert: "./seeders/10.1.254.12-cert.pem"
                }
            },
            {
                name: 'real',
                path: '10.1.254.12/',
                ssl: true
            },
            {
                name: 'vhost2',
                path: 'www2.wasp.co.jp',
                ssl: false
            }
        ]
    }
];

module.exports = {
	async up (queryInterface, Sequelize) {
		for	( let ent of USER )	{
			//console.log({ent})
			let user = new User(ent.name);
			user.password = ent.password;
			let u = await user.create();
			for ( let pro of ent.profiles )	{
				if	( pro.ssl )	{
					await models.Profile.create({
						userId: u.id,
						name: pro.name,
						path: pro.path,
						ssl: true,
						key: pro.ssl.key ? fs.readFileSync(pro.ssl.key, 'utf-8') : null,
						cert: pro.ssl.cert ? fs.readFileSync(pro.ssl.cert, 'utf-8') : null,
						ca: pro.ssl.ca ? fs.readFileSync(pro.ssl.ca, 'utf-8') : null,
					});
				} else {
					await models.Profile.create({
						userId: u.id,
						name: pro.name,
						path: pro.path,
						ssl: false
					});
				}
			}
		}
  	},

  	async down (queryInterface, Sequelize) {
    	 await queryInterface.bulkDelete('Users', null, {});
    	 await queryInterface.bulkDelete('Profiles', null, {});
  	}
};
