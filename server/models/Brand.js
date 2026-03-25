const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '品牌名称'
  },
  logo: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '品牌logo'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '品牌描述'
  },
  categoryIds: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: '所属分类ID数组'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  }
}, {
  tableName: 'brands',
  timestamps: true
});

module.exports = Brand;
