'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
    	static associate(models) {
			this.hasMany(models.Profile, {
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'profiles'
			});
			this.hasMany(models.Receipt, {
				foreignKey: 'userId',
				sourceKey: 'id',
				as: 'receipts'
			});
    	}
  	}
  	User.init({
    	name: DataTypes.STRING,
    	hash_password: DataTypes.STRING,
		mail: DataTypes.STRING,
		payLimitAt: DataTypes.DATE
  	}, {
    	sequelize,
    	modelName: 'User',
  	});
  	return User;
};
