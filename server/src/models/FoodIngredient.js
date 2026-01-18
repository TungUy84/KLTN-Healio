const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Meal = require('./Meal');
const RawFood = require('./RawFood');

const FoodIngredient = sequelize.define('FoodIngredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dish_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Meal,
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'FK to FOOD.id'
    },
    ingredient_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: RawFood,
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'FK to RAW FOOD.id'
    },
    amount_in_grams: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Khối lượng nguyên liệu (gram)'
    },
    original_unit_name: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Tên đơn vị gốc (VD: "cup", "piece")'
    },
    original_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Số lượng theo đơn vị gốc'
    }
}, {
    timestamps: true,
    tableName: 'food_ingredients',
    indexes: [
        {
            unique: true,
            fields: ['dish_id', 'ingredient_id']
        }
    ]
});

// Define relationships
Meal.belongsToMany(RawFood, {
    through: FoodIngredient,
    foreignKey: 'dish_id',
    otherKey: 'ingredient_id',
    as: 'ingredients'
});

RawFood.belongsToMany(Meal, {
    through: FoodIngredient,
    foreignKey: 'ingredient_id',
    otherKey: 'dish_id',
    as: 'meals'
});

FoodIngredient.belongsTo(Meal, {
    foreignKey: 'dish_id',
    as: 'food'
});

FoodIngredient.belongsTo(RawFood, {
    foreignKey: 'ingredient_id',
    as: 'rawFood'
});

module.exports = FoodIngredient;
