const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Document = sequelize.define('Document', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '分类ID'
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '品牌ID'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '资料标题'
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'PDF文件链接'
  },
  panelType: {
    type: DataTypes.ENUM('single', 'double', 'both'),
    defaultValue: 'both',
    comment: '组件类型: single-单玻, double-双玻, both-通用'
  },
  productModel: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '产品型号'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览次数'
  }
}, {
  tableName: 'documents',
  timestamps: true
});

module.exports = Document;
