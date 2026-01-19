const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Food = require('./Food');

const UserDailyLog = sequelize.define('UserDailyLog', {
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
    },
    meal_type: {
        type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Số lượng phần ăn (ví dụ 1.5 suất)'
    },
    // Lưu lại giá trị dinh dưỡng thực tế tại thời điểm log (đề phòng món ăn bị sửa sau này)
    calories: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    protein: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    carb: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fat: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    fiber: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
}, {
    tableName: 'user_daily_logs',
    timestamps: true
});

// Associations
User.hasMany(UserDailyLog, { foreignKey: 'user_id', as: 'dailyLogs' });
UserDailyLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Food.hasMany(UserDailyLog, { foreignKey: 'food_id', as: 'dailyLogs' });
UserDailyLog.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

module.exports = UserDailyLog;
