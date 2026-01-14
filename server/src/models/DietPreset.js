const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DietPreset = sequelize.define('DietPreset', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING, // EX: 'BALANCED', 'KETO'
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  carb_ratio: {
    type: DataTypes.INTEGER, // % (ex: 50)
    allowNull: false
  },
  protein_ratio: {
    type: DataTypes.INTEGER, // % (ex: 30)
    allowNull: false
  },
  fat_ratio: {
    type: DataTypes.INTEGER, // % (ex: 20)
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'diet_presets',
  timestamps: false
});

module.exports = DietPreset;