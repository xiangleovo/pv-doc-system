# 光伏资料库系统

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-24.14.0-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Vue.js-3.3.4-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/WeChat-小程序-07C160?style=flat-square&logo=wechat&logoColor=white" alt="微信小程序">
  <img src="https://img.shields.io/badge/MySQL-5.7.44-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License">
</p>

> 一个基于微信小程序的文档管理系统，专为光伏行业设计。支持品牌分类、文档搜索、收藏管理等功能，配套完整的后台管理系统。

---

## 📖 目录

- [项目简介](#-项目简介)
- [功能特性](#-功能特性)
- [系统架构](#-系统架构)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [环境配置](#-环境配置)
- [部署指南](#-部署指南)
- [API 文档](#-api-文档)
- [常见问题](#-常见问题)
- [更新日志](#-更新日志)

---

## 🌟 项目简介

光伏资料库系统是一个面向光伏行业的文档管理平台，提供以下核心能力：

- **小程序端**：用户可浏览、搜索、收藏各类光伏产品文档
- **管理后台**：管理员可上传、编辑、管理品牌和文档
- **文件存储**：支持本地存储或腾讯云 COS 对象存储

### 适用场景

- 光伏组件厂商的产品资料管理
- 经销商/代理商的产品文档查询
- 技术人员的技术资料库

---

## ✨ 功能特性

### 小程序端功能

| 功能模块 | 描述 |
|---------|------|
| 📚 资料库浏览 | 按品牌、分类筛选查看文档列表 |
| 🔍 智能搜索 | 支持关键词搜索，防抖优化 |
| ❤️ 收藏管理 | 用户可收藏常用文档，快速访问 |
| 📊 浏览统计 | 记录用户浏览历史，展示浏览次数 |
| 🎨 交互动画 | 流畅的页面切换和微交互动效 |
| 📱 响应式布局 | 适配各种手机屏幕尺寸 |

### 管理后台功能

| 功能模块 | 描述 |
|---------|------|
| 🏷️ 品牌管理 | 增删改查品牌信息，上传品牌 Logo |
| 📂 分类管理 | 自定义文档分类，支持多级分类 |
| 📄 文档管理 | 上传 PDF 文档，编辑文档信息 |
| 📤 文件上传 | 支持拖拽上传，进度显示 |
| 📈 数据统计 | 查看文档访问量、收藏数等统计 |
| 🔐 权限控制 | JWT 认证，管理员权限验证 |

---

## 🏗️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   微信小程序  │  │   管理后台   │  │   移动端浏览器 │      │
│  │  (miniprogram)│  │    (admin)   │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │ HTTPS/HTTP
┌───────────────────────────┼─────────────────────────────────┐
│                      API 层 (server)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Node.js + Express                       │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │  品牌管理 │ │ 文档管理 │ │ 用户管理 │ │ 文件上传 │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                      数据层                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    MySQL     │  │  本地文件系统 │  │ 腾讯云 COS   │      │
│  │  (Sequelize) │  │  (uploads/)  │  │  (可选)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 技术栈

### 后端 (server/)

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 24.14.0 | 运行时环境 |
| Express | ^4.18.2 | Web 框架 |
| Sequelize | ^6.33.0 | ORM 数据库操作 |
| MySQL2 | ^3.6.0 | MySQL 驱动 |
| JWT | ^9.0.2 | 身份认证 |
| bcryptjs | ^2.4.3 | 密码加密 |
| Multer | ^1.4.5-lts.1 | 文件上传 |
| COS SDK | ^2.15.4 | 腾讯云对象存储 |

### 管理后台 (admin/)

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | ^3.3.4 | 前端框架 |
| Vite | ^5.0.0 | 构建工具 |
| Element Plus | ^2.4.2 | UI 组件库 |
| Pinia | ^2.1.7 | 状态管理 |
| Vue Router | ^4.2.5 | 路由管理 |
| Axios | ^1.6.0 | HTTP 客户端 |
| Tailwind CSS | ^3.4.19 | 原子化 CSS |

### 小程序 (miniprogram/)

| 技术 | 用途 |
|------|------|
| 微信小程序原生 API | 基础框架 |
| TDesign 组件库 | UI 组件 |
| WXSS | 样式编写 |

---

## 📁 项目结构

```
pv-doc-system/
├── 📁 miniprogram/              # 微信小程序前端
│   ├── 📁 pages/                # 页面目录
│   │   ├── filter/              # 首页 - 品牌筛选
│   │   ├── library/             # 资料库列表
│   │   ├── detail/              # 文档详情
│   │   ├── mine/                # 个人中心
│   │   ├── favorite/            # 收藏列表
│   │   └── about/               # 关于页面
│   ├── 📁 components/           # 公共组件
│   │   ├── doc-card/            # 文档卡片
│   │   ├── brand-card/          # 品牌卡片
│   │   └── custom-tabbar/       # 自定义 TabBar
│   ├── 📁 utils/                # 工具函数
│   ├── 📁 images/               # 图片资源
│   ├── app.js                   # 小程序入口
│   ├── app.json                 # 全局配置
│   └── app.wxss                 # 全局样式
│
├── 📁 server/                   # 后端 API 服务
│   ├── 📁 config/               # 配置文件
│   │   └── database.js          # 数据库配置
│   ├── 📁 models/               # 数据模型
│   │   ├── User.js              # 用户模型
│   │   ├── Brand.js             # 品牌模型
│   │   ├── Category.js          # 分类模型
│   │   └── Document.js          # 文档模型
│   ├── 📁 controllers/          # 控制器
│   │   ├── authController.js    # 认证相关
│   │   ├── brandController.js   # 品牌管理
│   │   ├── documentController.js # 文档管理
│   │   └── uploadController.js  # 文件上传
│   ├── 📁 routes/               # 路由定义
│   ├── 📁 middlewares/          # 中间件
│   ├── 📁 public/               # 静态文件
│   │   └── uploads/             # 上传文件目录
│   ├── app.js                   # 服务入口
│   ├── .env                     # 环境变量（本地配置，不上传）
│   ├── .env.example             # 环境变量模板
│   └── package.json
│
├── 📁 admin/                    # 管理后台
│   ├── 📁 src/
│   │   ├── 📁 views/            # 页面视图
│   │   │   ├── Login.vue        # 登录页
│   │   │   ├── Dashboard.vue    # 仪表盘
│   │   │   ├── BrandManage.vue  # 品牌管理
│   │   │   ├── CategoryManage.vue # 分类管理
│   │   │   └── DocumentManage.vue # 文档管理
│   │   ├── 📁 components/       # 公共组件
│   │   ├── 📁 stores/           # Pinia 状态管理
│   │   ├── 📁 utils/            # 工具函数
│   │   ├── App.vue              # 根组件
│   │   └── main.js              # 入口文件
│   ├── index.html
│   └── package.json
│
├── 📄 .gitignore                # Git 忽略配置
└── 📄 README.md                 # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0 (推荐 24.14.0)
- **MySQL**: >= 5.7.0
- **微信开发者工具**: 最新版
- **Git**: 任意版本

### 1. 克隆项目

```bash
git clone <你的仓库地址>
cd pv-doc-system
```

### 2. 配置后端环境

```bash
cd server

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填写你的数据库和密钥信息
# 参考下方的环境配置说明
```

### 3. 初始化数据库

```bash
# 创建数据库（在 MySQL 中执行）
CREATE DATABASE pv_doc_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 启动服务，会自动同步数据表
npm run dev
```

### 4. 启动管理后台

```bash
cd ../admin

# 安装依赖
npm install

# 开发模式启动
npm run dev
```

管理后台将运行在 `http://localhost:5173`

### 5. 导入小程序

1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择 `pv-doc-system/miniprogram` 目录
4. 填入你的小程序 AppID
5. 点击「编译」运行

---

## ⚙️ 环境配置

### 后端配置 (server/.env)

复制 `server/.env.example` 为 `server/.env`，并填写以下配置：

```env
# ── 数据库配置 ──────────────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pv_doc_system
DB_USER=your_database_user
DB_PASSWORD=your_database_password

# ── JWT 密钥 ─────────────────────────────────────────────
# 生成命令：node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_random_secret_key_here

# ── 服务器配置 ────────────────────────────────────────────
PORT=3001
NODE_ENV=development
BASE_URL=http://localhost:3001

# ── CORS 配置 ─────────────────────────────────────────────
CORS_ORIGIN=http://localhost:5173

# ── 文件上传限制 ──────────────────────────────────────────
MAX_FILE_SIZE=2097152

# ── 默认管理员账号配置 ──────────────────────────────────
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
ADMIN_NICKNAME=管理员

# ── 微信小程序配置 ─────────────────────────────────────────
WX_APPID=your_wx_appid
WX_SECRET=your_wx_appsecret

# ── 腾讯云 COS 配置（可选）─────────────────────────────────
COS_SECRET_ID=your_cos_secret_id
COS_SECRET_KEY=your_cos_secret_key
COS_BUCKET=your-bucket
COS_REGION=ap-guangzhou
COS_PREFIX=pdfs/
```

### 管理后台配置

在 `admin/` 目录下创建 `.env` 文件：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 小程序配置

修改 `miniprogram/config/api.js` 中的 API 地址：

```javascript
const API_BASE_URL = 'http://localhost:3001/api'  // 开发环境
// const API_BASE_URL = 'https://api.example.com/api'  // 生产环境，修改为你的域名
```

---

## 📦 部署指南

### 后端部署（使用 PM2）

```bash
cd server

# 安装 PM2
npm install -g pm2

# 创建 ecosystem.config.json
cat > ecosystem.config.json << 'EOF'
{
  "apps": [{
    "name": "pv-doc-server",
    "script": "./app.js",
    "instances": 1,
    "autorestart": true,
    "watch": false,
    "max_memory_restart": "1G",
    "env": {
      "NODE_ENV": "production"
    },
    "log_date_format": "YYYY-MM-DD HH:mm:ss Z"
  }]
}
EOF

# 启动服务
pm2 start ecosystem.config.json

# 查看日志
pm2 logs pv-doc-server

# 重启服务
pm2 restart pv-doc-server
```

### 管理后台部署

```bash
cd admin

# 生产构建
npm run build

# 将 dist/ 目录部署到 Nginx 或静态服务器
```

### Nginx 配置示例

```nginx
# 后端 API
server {
    listen 80;
    server_name api.example.com;  # 修改为你的域名
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 管理后台
server {
    listen 80;
    server_name admin.example.com;  # 修改为你的域名
    
    location / {
        root /path/to/pv-doc-system/admin/dist;  # 修改为实际路径
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📚 API 文档

### 认证相关

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |

### 品牌管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/brands` | 获取品牌列表 |
| POST | `/api/brands` | 创建品牌 |
| PUT | `/api/brands/:id` | 更新品牌 |
| DELETE | `/api/brands/:id` | 删除品牌 |

### 文档管理

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/documents` | 获取文档列表 |
| GET | `/api/documents/:id` | 获取文档详情 |
| POST | `/api/documents` | 创建文档 |
| PUT | `/api/documents/:id` | 更新文档 |
| DELETE | `/api/documents/:id` | 删除文档 |

### 文件上传

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/upload` | 上传文件 |

---

## ❓ 常见问题

### Q: 首次启动时管理员账号没有自动创建？

A: 检查 `server/.env` 中的 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD` 是否已配置，然后重启服务。

### Q: 小程序无法连接后端？

A: 
1. 确认手机和电脑在同一局域网
2. 检查小程序的 `config/api.js` 中的 API 地址是否正确
3. 在微信开发者工具中开启「不校验合法域名」

### Q: 文件上传失败？

A:
1. 检查 `MAX_FILE_SIZE` 配置是否足够大
2. 确认 `public/uploads` 目录有写入权限
3. 如果使用 COS，检查密钥配置是否正确

### Q: 如何切换本地存储和 COS 存储？

A: 在 `server/.env` 中配置 COS 相关变量后，系统会自动使用 COS 存储；未配置则使用本地存储。

---

## 📝 更新日志

### v1.3.3 (2026-03-26)

**缓存管理优化**
- ✅ 限制 PDF 缓存最多保留 5 个文件（自动清理旧文件）
- ✅ 预加载前自动检查并清理缓存
- ✅ 存储配额超限时无感清理并重试
- ✅ "我的"页面添加手动清理缓存功能

**首页体验优化**
- ✅ 过滤无资料文件的品牌（首页不展示空品牌）

**UI 优化**
- ✅ "我的"页面布局压缩，一屏完整显示
- ✅ 移除 PDF 按钮下载状态，统一使用弹窗提示
- ✅ 修复菜单项顶部留白不一致问题

**文件变更**
- `miniprogram/pages/detail/detail.js` - 优化缓存清理逻辑
- `miniprogram/pages/mine/mine.js` - 添加清理缓存功能
- `miniprogram/pages/mine/mine.wxml` - 添加清理缓存入口
- `miniprogram/pages/filter/filter.js` - 过滤空品牌

### v1.3.2 (2026-03-26)

**PDF 体验优化**
- ✅ 添加 PDF 预加载功能（进入详情页自动下载，点击直接打开）
- ✅ 优化提示文案（"正在打开文档"替代"正在下载"）
- ✅ 增加下载超时时间至 120 秒

**文件上传安全**
- ✅ 添加重复文件检测（COS 层 + 数据库层双重校验）
- ✅ 上传重复文件时提示已存在的资料信息

**CDN 优化**
- ✅ 配置 PDF 文件 CDN 缓存规则（30 天节点缓存）

**文件变更**
- `miniprogram/pages/detail/detail.js` - 添加 preloadPdf 预加载函数
- `server/routes/settings.js` - 添加重复文件检测逻辑
- `admin/src/views/Documents.vue` - 重复文件提示弹窗

### v1.3.1 (2026-03-26)

**小程序优化**
- ✅ 优化 PDF 打开速度（使用 `wx.downloadFile` 替代 `wx.request`）
- ✅ 添加 PDF 下载进度显示（实时显示百分比）
- ✅ 添加 PDF 文件缓存（二次打开无需重新下载）
- ✅ 添加下载超时处理（60秒超时）
- ✅ 修复缓存文件路径获取问题

**文件变更**
- `miniprogram/pages/detail/detail.js` - 重写 openPDF 函数，优化下载和缓存逻辑

### v1.3.0 (2026-03-25)

**安全性增强**
- ✅ 添加 Helmet 安全头中间件（XSS 防护、CSP 等）
- ✅ 添加 express-rate-limit 限流保护（防暴力攻击）
- ✅ 登录接口独立限流（生产环境 5 次/15分钟）
- ✅ 修复 CORS 生产环境安全配置
- ✅ 缩短 JWT 过期时间（管理员 12h，小程序 7 天）
- ✅ 添加全局错误处理中间件
- ✅ 升级 Express 4.18.2 → 4.22.1

**性能优化**
- ✅ 添加 compression 响应压缩中间件
- ✅ 添加数据库索引优化（10 个索引）
- ✅ 修复小程序 http→https 替换逻辑
- ✅ 移除管理后台调试 console.log

**文件变更**
- `server/app.js` - 安全中间件 + 限流 + 压缩
- `server/controllers/authController.js` - JWT 过期时间
- `server/package.json` - 新增依赖
- `server/scripts/indexes.sql` - 数据库索引脚本（新增）
- `admin/src/utils/request.js` - 清理调试代码
- `miniprogram/pages/detail/detail.js` - 修复 PDF URL 处理

### v1.2.0 (2026-03-25)

**项目结构优化**
- ✅ 重构项目结构，将 `backend` 重命名为 `server`
- ✅ 完善环境变量配置，支持从 `.env` 读取管理员账号
- ✅ 删除敏感信息文件，添加 `.env.example` 配置模板
- ✅ 更新 `.gitignore`，确保敏感文件不上传

**前端体验优化**
- ✅ 优化小程序交互动画体验（全局动画系统、微交互效果）
- ✅ 完善 README 文档

### v1.1.0 (2026-03-23 ~ 03-24)

**用户功能增强**
- ✅ 添加手机号绑定功能，支持微信授权获取手机号
- ✅ 添加手机号解绑功能
- ✅ 修改个人资料弹窗支持编辑手机号

**安全与稳定性**
- ✅ 修复用户禁用功能，后端增加状态校验
- ✅ 修复安卓手机资料详情页 ID 类型不匹配问题

**代码清理**
- ✅ 删除未使用的页面（pdf-viewer、webview）
- ✅ 删除未使用的图片资源
- ✅ 清理所有 `console.log` 调试代码
- ✅ 清理 WXML/JS/WXSS 中的无用注释

### v1.0.0 (2026-03-17)

- 🎉 项目初始版本发布
- ✅ 完成基础功能：品牌管理、文档管理、收藏功能
- ✅ 支持本地文件上传和腾讯云 COS 存储
- ✅ 完成小程序端 UI 和交互
- ✅ 完成管理后台基础功能

---

<p align="center">
  Made with ❤️ for the photovoltaic industry
</p>
