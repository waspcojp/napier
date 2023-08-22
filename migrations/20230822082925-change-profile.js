'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up (queryInterface, Sequelize) {
    	await queryInterface.addColumn('Profiles', 'lets', {
      		type: Sequelize.BOOLEAN
		});
  	},

	async down (queryInterface, Sequelize) {
		await queryInterface.removeColumn('Profiles', 'lets');
  	}
};
