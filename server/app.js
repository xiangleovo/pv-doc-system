require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

// Helmet 安全头中间件
app.use(helmet({
  contentSecurityPolicy: false, // 允许内联脚本（管理后台需要）
  crossOriginEmbedderPolicy: false // 允许跨域嵌入
}));

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟窗口
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // 生产环境 100 请求/15分钟，开发环境 10000
  message: { success: false, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  // 跳过健康检查端点
  skip: (req) => req.path === '/health'
});

// 更严格的限流：登录接口（防暴力破解）
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 生产环境 5 次，开发环境 100 次
  message: { success: false, message: '登录尝试次数过多，请15分钟后再试' },
  skipSuccessfulRequests: true // 成功的请求不计数
});

app.use(limiter);

// CORS配置：支持多个域名
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: function (origin, callback) {
    const corsOrigin = process.env.CORS_ORIGIN;

    // 生产环境必须配置 CORS_ORIGIN，不允许使用 *
    if (process.env.NODE_ENV === 'production') {
      if (!corsOrigin || corsOrigin === '*') {
        console.error('警告：生产环境必须配置具体的 CORS_ORIGIN，不能使用 *');
        return callback(new Error('CORS not configured properly'));
      }
    }

    // 开发环境或没有 origin（如服务器请求），允许
    if (process.env.NODE_ENV !== 'production' || !origin) {
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

// 路由 - 登录接口应用更严格的限流
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/wx/login', authLimiter);

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

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // CORS 错误
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: '非法来源' });
  }
  
  // 其他错误
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? '服务器内部错误' 
      : err.message
  });
});

// 初始化数据库
const initDatabase = async () => {
  try {
    // 不自动修改表结构，使用 migrations 或手动迁移
    await sequelize.sync({ force: false, alter: false });
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
