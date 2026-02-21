const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Food = require('./Food');
const DietPreset = require('./DietPreset');

const FoodDietPreset = sequelize.define('FoodDietPreset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    diet_preset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: DietPreset,
            key: 'id'
        },
        onDelete: 'CASCADE'
    }
}, {
    tableName: 'food_diet_presets',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['food_id', 'diet_preset_id']
        }
    ]
});

// Define Relationships
Food.belongsToMany(DietPreset, {
    through: FoodDietPreset,
    foreignKey: 'food_id',
    otherKey: 'diet_preset_id',
    as: 'dietPresets'
});

DietPreset.belongsToMany(Food, {
    through: FoodDietPreset,
    foreignKey: 'diet_preset_id',
    otherKey: 'food_id',
    as: 'foods'
});

module.exports = FoodDietPreset;
