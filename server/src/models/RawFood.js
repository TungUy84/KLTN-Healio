const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RawFood = sequelize.define('RawFood', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
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
    unit: {
        type: DataTypes.STRING,
        defaultValue: '100g'
    },
    // Macro nutrients (per 100g usually)
    energy_kcal: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    protein_g: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fat_g: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    carb_g: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fiber_g: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    // Flexible object for micronutrients (Calcium, Iron, Vitamins...)
    // Example: { "Calcium_mg": 100, "Vit_A_mcg": 50 }
    micronutrients: {
        type: DataTypes.JSONB, // Use JSONB for Postgres
        defaultValue: {}
    }
}, {
    timestamps: true,
    tableName: 'raw_foods'
});

module.exports = RawFood;
