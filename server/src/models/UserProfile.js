const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserProfile = sequelize.define('UserProfile', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY, // Chỉ lưu ngày sinh
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT, // cm
    allowNull: true
  },
  current_weight: {
    type: DataTypes.FLOAT, // kg
    allowNull: true
  },
  activity_level: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: true
  },
  goal_type: {
    type: DataTypes.ENUM('lose_weight', 'maintain', 'gain_weight'),
    defaultValue: 'maintain'
  },
  goal_weight: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  }
}, {
  tableName: 'user_profiles',
  timestamps: false
});

// Thiết lập quan hệ
User.hasOne(UserProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = UserProfile;