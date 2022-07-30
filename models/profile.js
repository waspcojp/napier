'use strict';
const {
	Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Profile extends Model {
    	/**
     	* Helper method for defining associations.
     	* This method is not a part of Sequelize lifecycle.
     	* The `models/index` file will call this method automatically.
     	*/
    	static associate(models) {
			this.belongsTo(models.User, {
				foreignKey: 'userId',
				onDelete: 'CASCADE'
			});
    	}
  	}
  	Profile.init({
		userId: DataTypes.INTEGER,
	    name: DataTypes.STRING,
    	path: DataTypes.STRING,
		ssl: DataTypes.BOOLEAN,
		key: DataTypes.TEXT,
		cert: DataTypes.TEXT,
		ca: DataTypes.TEXT
  	}, {
	    sequelize,
	    modelName: 'Profile',
  	});
  	return Profile;
};