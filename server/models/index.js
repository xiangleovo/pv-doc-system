const sequelize = require('../config/database');
const User = require('./User');
const Brand = require('./Brand');
const Category = require('./Category');
const Document = require('./Document');
const Favorite = require('./Favorite');
const ViewLog = require('./ViewLog');
const Config = require('./Config');

// 定义模型关联
Document.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Document, { foreignKey: 'categoryId', as: 'documents' });

Document.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
Brand.hasMany(Document, { foreignKey: 'brandId', as: 'documents' });

Favorite.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Favorite, { foreignKey: 'userId', as: 'favorites' });

Favorite.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
Document.hasMany(Favorite, { foreignKey: 'documentId', as: 'favorites' });

ViewLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(ViewLog, { foreignKey: 'userId', as: 'viewLogs' });

ViewLog.belongsTo(Document, { foreignKey: 'documentId', as: 'document' });
Document.hasMany(ViewLog, { foreignKey: 'documentId', as: 'viewLogs' });

module.exports = {
  sequelize,
  User,
  Brand,
  Category,
  Document,
  Favorite,
  ViewLog,
  Config
};
