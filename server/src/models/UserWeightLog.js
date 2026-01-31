const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserWeightLog = sequelize.define('UserWeightLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_weight_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

// Quan hệ
User.hasMany(UserWeightLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserWeightLog.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserWeightLog;
