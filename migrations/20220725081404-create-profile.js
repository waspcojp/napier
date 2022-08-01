'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profiles', {
    	id: {
    		allowNull: false,
        	autoIncrement: true,
        	primaryKey: true,
        	type: Sequelize.INTEGER
      	},
      	userId: {
        	type: Sequelize.INTEGER,
			unique: 'profileUserName'
      	},
      	name: {
    		allowNull: false,
        	type: Sequelize.STRING,
			unique: 'profileUserName'
      	},
      	path: {
    		allowNull: false,
        	type: Sequelize.STRING
      	},
		ssl: {
    		allowNull: false,
			type: Sequelize.BOOLEAN
		},
      	key: {
			allowNull: true,
        	type: Sequelize.TEXT
      	},
      	cert: {
			allowNull: true,
        	type: Sequelize.TEXT
      	},
      	ca: {
			allowNull: true,
        	type: Sequelize.TEXT
      	},
      	createdAt: {
        	allowNull: false,
        	type: Sequelize.DATE
      	},
      	updatedAt: {
        	allowNull: false,
        	type: Sequelize.DATE
      	}
    }, {
		uniqueKeys: {
			profileUserName: {
				fields: [ 'userId', 'name']
			}
		}
	});
  	},
  	async down(queryInterface, Sequelize) {
    	await queryInterface.dropTable('Profiles');
  	}
};