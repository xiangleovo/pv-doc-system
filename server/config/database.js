const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    timezone: '+08:00',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000,
      // 生产环境优化
      evict: 10000
    },
    // MySQL 5.7 优化配置
    dialectOptions: {
      typeCast(field, next) {
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
          return new Date(field.string() + 'Z');
        }
        return next();
      }
    }
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('数据库连接成功');
    }
  })
  .catch(err => {
    console.error('数据库连接失败:', err);
    process.exit(1);
  });

module.exports = sequelize;
