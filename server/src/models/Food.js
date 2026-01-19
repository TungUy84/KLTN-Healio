const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Food = sequelize.define('Food', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Serving unit (e.g., "1 tô", "1 dĩa")
    serving_unit: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'suất'
    },
    cooking: {
        type: DataTypes.TEXT,
        defaultValue: '',
        field: 'cooking'
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by_user_id'
    },
    calories: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'calories'
    },
    protein: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'protein'
    },
    carb: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'carb'
    },
    fat: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        field: 'fat'
    },
    micronutrients: {
        type: DataTypes.JSONB,
        defaultValue: {},
        field: 'micronutrients'
    },
    // Additional fields for app logic (may not be in DB schema but needed)
    // AC2: Meal Categories - Array of strings: ['breakfast', 'lunch', 'dinner', 'snack']
    meal_categories: {
        type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL ARRAY
        defaultValue: []
    },
    // Status: active, inactive, or deleted (soft delete)
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active'
    },
    // Diet tags: Auto tag based on macro ratios (e.g., 'keto', 'low_carb', 'high_protein')
    diet_tags: {
        type: DataTypes.ARRAY(DataTypes.STRING), // PostgreSQL ARRAY
        defaultValue: []
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'foods'
});

module.exports = Food;
