const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorite = sequelize.define('Favorite', {
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
  tableName: 'favorites',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'documentId']
    }
  ]
});

module.exports = Favorite;
