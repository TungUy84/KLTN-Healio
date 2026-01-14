const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const DietPreset = require('./DietPreset');

const UserNutritionTarget = sequelize.define('UserNutritionTarget', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  diet_preset_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: DietPreset,
      key: 'id'
    }
  },
  tdee: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  target_calories: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'user_nutrition_targets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Quan hệ
User.hasOne(UserNutritionTarget, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserNutritionTarget.belongsTo(User, { foreignKey: 'user_id' });
UserNutritionTarget.belongsTo(DietPreset, { foreignKey: 'diet_preset_id' });

module.exports = UserNutritionTarget;