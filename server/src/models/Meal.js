const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meal = sequelize.define('Meal', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ''
    },
    // AC2: Meal Categories - Array of strings: ['breakfast', 'lunch', 'dinner', 'snack']
    meal_categories: {
        type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL ARRAY
        defaultValue: []
    },
    // Total calories (calculated from ingredients)
    total_calories: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    // Status: active or inactive
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    },
    // Diet tags: Auto tag based on macro ratios (e.g., 'keto', 'low_carb', 'high_protein')
    diet_tags: {
        type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL ARRAY
        defaultValue: []
    }
}, {
    timestamps: true,
    tableName: 'meals'
});

module.exports = Meal;
