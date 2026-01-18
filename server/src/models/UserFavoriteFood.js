const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Food = require('./Food');

const UserFavoriteFood = sequelize.define('UserFavoriteFood', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'user_favorite_foods',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'food_id']
        }
    ]
});

// Define Associations
User.belongsToMany(Food, { 
    through: UserFavoriteFood, 
    foreignKey: 'user_id',
    otherKey: 'food_id', 
    as: 'favoriteFoods' 
});

Food.belongsToMany(User, { 
    through: UserFavoriteFood, 
    foreignKey: 'food_id',
    otherKey: 'user_id',
    as: 'favoritedByUsers' 
});

// Needed for direct queries on UserFavoriteFood
UserFavoriteFood.belongsTo(User, { foreignKey: 'user_id' });
UserFavoriteFood.belongsTo(Food, { foreignKey: 'food_id' });

module.exports = UserFavoriteFood;
