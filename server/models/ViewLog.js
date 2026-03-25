const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ViewLog = sequelize.define('ViewLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '用户ID'
  },
  documentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '资料ID'
  }
}, {
  tableName: 'view_logs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['documentId'] },
    // 同一用户同一资料只记录一次（去重）
    {
      unique: true,
      fields: ['userId', 'documentId']
    }
  ]
});

module.exports = ViewLog;
