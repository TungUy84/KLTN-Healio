const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Food = require('./Food');
const RawFood = require('./RawFood');

const FoodIngredient = sequelize.define('FoodIngredient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // food_id là món ăn (đổi từ dish_id)
    food_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Food,
            key: 'id'
        },
        onDelete: 'CASCADE',
        comment: 'FK to FOOD.id'
    },
    raw_food_id: {
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
            fields: ['food_id', 'raw_food_id']
        }
    ]
});

// Define relationships
Food.belongsToMany(RawFood, {
    through: FoodIngredient,
    foreignKey: 'food_id',
    otherKey: 'raw_food_id',
    as: 'ingredients'
});

RawFood.belongsToMany(Food, {
    through: FoodIngredient,
    foreignKey: 'raw_food_id',
    otherKey: 'food_id',
    as: 'foods'
});

FoodIngredient.belongsTo(Food, {
    foreignKey: 'food_id',
    as: 'food'
});

FoodIngredient.belongsTo(RawFood, {
    foreignKey: 'raw_food_id',
    as: 'rawFood'
});

module.exports = FoodIngredient;
