const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '配置项键名'
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配置项值'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '配置项描述'
  }
}, {
  tableName: 'configs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['key']
    }
  ]
});

module.exports = Config;
