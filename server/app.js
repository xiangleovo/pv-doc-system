require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const documentRoutes = require('./routes/documents');
const brandRoutes = require('./routes/brands');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admins');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');
const configRoutes = require('./routes/config');
const bcrypt = require('bcryptjs');
const { User } = require('./models');

const app = express();

// 生产环境安全中间件
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // 信任反向代理
}

// CORS配置：支持多个域名
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: function (origin, callback) {
    const corsOrigin = process.env.CORS_ORIGIN || '*';

    // 如果设置为 * 或没有origin（如服务器请求），允许所有
    if (corsOrigin === '*' || !origin) {
      return callback(null, true);
    }

    // 支持逗号分隔的多个域名
    const allowedOrigins = corsOrigin.split(',').map(o => o.trim());

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/configs', configRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', env: process.env.NODE_ENV });
});

// 初始化数据库
const initDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('数据库同步成功');

    // 创建默认管理员账号
    const adminCount = await User.count({
      where: { role: 'admin' }
    });

    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const password = process.env.ADMIN_PASSWORD || 'admin123';
      const nickname = process.env.ADMIN_NICKNAME || '管理员';
      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        password: hashedPassword,
        role: 'admin',
        nickname
      });
      console.log(`默认管理员账号已创建: ${username} / ${password}`);
    }
  } catch (error) {
    console.error('数据库初始化错误:', error);
  }
};

// 启动服务器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, async () => {
  console.log(`服务器运行在端口 ${PORT}`);
  await initDatabase();
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM信号接收,关闭服务器...');
  server.close(() => {
    sequelize.close();
    process.exit(0);
  });
});

module.exports = app;
