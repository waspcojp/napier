'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up (queryInterface, Sequelize) {
    	await queryInterface.addColumn('Users', 'mail', {
      		type: Sequelize.STRING
		});
    	await queryInterface.addColumn('Users', 'payLimitAt', {
      		type: Sequelize.DATE,
      		allowNull: true
		});
  	},

  	async down (queryInterface, Sequelize) {
		await queryInterface.removeColumn('Users', 'mail');
		await queryInterface.removeColumn('Users', 'pqlLimitAt');
  	}
};
