const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const COS = require('cos-nodejs-sdk-v5');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// 临时存储（用于上传到 COS 前的缓存）
const tmpDir = path.join(__dirname, '../public/tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// 修复中文文件名乱码（处理 latin1 编码）
const fixFileName = (name) => {
  try {
    // multer 默认用 latin1 解码，需要转回 buffer 再用 utf8 解码
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch (e) {
    return name;
  }
};

// multer：临时存储 PDF 文件（最大 200MB）
const tmpStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tmpDir),
  filename: (req, file, cb) => {
    // 修复中文文件名
    const originalName = fixFileName(file.originalname);
    const ext = path.extname(originalName) || '.pdf';
    cb(null, Date.now() + '-' + Math.random().toString(36).substring(2, 10) + ext);
  }
});
const pdfUpload = multer({
  storage: tmpStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/octet-stream'];
    // 也允许文件扩展名为 .pdf 的文件
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 PDF 文件'), false);
    }
  },
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

// ── 获取 COS 配置（脱敏返回） ──
router.get('/cos', authMiddleware, adminAuthMiddleware, (req, res) => {
  const secretId = process.env.COS_SECRET_ID || '';
  const secretKey = process.env.COS_SECRET_KEY || '';
  res.json({
    success: true,
    data: {
      secretId: secretId ? secretId.substring(0, 6) + '***' + secretId.slice(-4) : '',
      secretKey: secretKey ? '***' : '',
      bucket: process.env.COS_BUCKET || '',
      region: process.env.COS_REGION || '',
      domain: process.env.COS_DOMAIN || '',
      prefix: process.env.COS_PREFIX || 'pdfs/',
      // 是否已配置
      configured: !!(secretId && secretKey && process.env.COS_BUCKET && process.env.COS_REGION)
    }
  });
});

// ── 保存 COS 配置（写入 .env） ──
router.post('/cos', authMiddleware, adminAuthMiddleware, (req, res) => {
  try {
    const { secretId, secretKey, bucket, region, domain, prefix } = req.body;

    if (!secretId || !secretKey || !bucket || !region) {
      return res.status(400).json({ success: false, message: 'SecretId、SecretKey、Bucket、Region 不能为空' });
    }

    const envPath = path.join(__dirname, '../.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }

    // 更新或追加 COS 相关配置
    const cosKeys = {
      COS_SECRET_ID: secretId,
      COS_SECRET_KEY: secretKey,
      COS_BUCKET: bucket,
      COS_REGION: region,
      COS_DOMAIN: domain || '',
      COS_PREFIX: prefix || 'pdfs/',
    };

    Object.entries(cosKeys).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}=${value}`;
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, line);
      } else {
        envContent += (envContent.endsWith('\n') ? '' : '\n') + line + '\n';
      }
    });

    fs.writeFileSync(envPath, envContent, 'utf-8');

    // 同步更新到当前进程环境变量（无需重启立即生效）
    process.env.COS_SECRET_ID = secretId;
    process.env.COS_SECRET_KEY = secretKey;
    process.env.COS_BUCKET = bucket;
    process.env.COS_REGION = region;
    process.env.COS_DOMAIN = domain || '';
    process.env.COS_PREFIX = prefix || 'pdfs/';

    res.json({ success: true, message: 'COS 配置已保存' });
  } catch (error) {
    console.error('保存 COS 配置失败:', error);
    res.status(500).json({ success: false, message: '保存配置失败: ' + error.message });
  }
});

// ── 测试 COS 连接 ──
router.post('/cos/test', authMiddleware, adminAuthMiddleware, async (req, res) => {
  try {
    const secretId = process.env.COS_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY;
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;

    if (!secretId || !secretKey || !bucket || !region) {
      return res.status(400).json({ success: false, message: '请先完成 COS 配置' });
    }

    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

    await new Promise((resolve, reject) => {
      cos.getBucketLocation({ Bucket: bucket, Region: region }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    res.json({ success: true, message: '连接成功，COS 配置有效！' });
  } catch (error) {
    console.error('COS 连接测试失败:', error);
    res.status(400).json({ success: false, message: '连接失败: ' + (error.message || error.Code || '未知错误') });
  }
});

// ── 上传 PDF 到 COS ──
router.post('/cos/upload-pdf', authMiddleware, adminAuthMiddleware, pdfUpload.single('file'), async (req, res) => {
  const tmpFile = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择要上传的 PDF 文件' });
    }

    const { categoryId, brandId } = req.body;
    if (!categoryId || !brandId) {
      return res.status(400).json({ success: false, message: '请先选择分类和品牌' });
    }

    const secretId = process.env.COS_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY;
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;
    const prefix = process.env.COS_PREFIX || 'pdfs/';
    const customDomain = process.env.COS_DOMAIN || '';

    if (!secretId || !secretKey || !bucket || !region) {
      return res.status(400).json({ success: false, message: '请先在系统设置中配置腾讯云 COS' });
    }

    // 查询分类和品牌名称
    const { Category, Brand } = require('../models');
    const [category, brand] = await Promise.all([
      Category.findByPk(categoryId),
      Brand.findByPk(brandId)
    ]);

    if (!category) {
      return res.status(400).json({ success: false, message: '所选分类不存在' });
    }
    if (!brand) {
      return res.status(400).json({ success: false, message: '所选品牌不存在' });
    }

    // 构建存储路径：prefix/分类名/品牌名/文件名
    const sanitizeName = (name) => name.replace(/[^\w\u4e00-\u9fa5-]/g, '_');
    const categoryName = sanitizeName(category.name);
    const brandName = sanitizeName(brand.name);

    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

    // 修复中文文件名（multer 默认 latin1 编码）
    const originalName = fixFileName(req.file.originalname);
    const ext = path.extname(originalName) || '.pdf';
    const originalBaseName = path.basename(originalName, ext);
    const safeFileName = sanitizeName(originalBaseName) + ext;
    const cosKey = `${prefix}${categoryName}/${brandName}/${safeFileName}`;

    // 上传到 COS
    await new Promise((resolve, reject) => {
      cos.uploadFile({
        Bucket: bucket,
        Region: region,
        Key: cosKey,
        FilePath: tmpFile,
        ContentType: 'application/pdf',
        onProgress: (progressData) => {
          // 可以通过 SSE 推送进度，这里简化处理
        }
      }, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    // 生成访问 URL
    let fileUrl;
    if (customDomain) {
      const domain = customDomain.replace(/\/$/, '');
      fileUrl = `${domain}/${cosKey}`;
    } else {
      fileUrl = `https://${bucket}.cos.${region}.myqcloud.com/${cosKey}`;
    }

    // 删除临时文件
    if (tmpFile && fs.existsSync(tmpFile)) {
      fs.unlinkSync(tmpFile);
    }

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: fileUrl,
        key: cosKey,
        originalName: originalName,
        fileName: safeFileName,
        title: originalBaseName, // 无扩展名的原文件名
        size: req.file.size
      }
    });
  } catch (error) {
    // 清理临时文件
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
    }
    console.error('上传 PDF 到 COS 失败:', error);
    res.status(500).json({ success: false, message: '上传失败: ' + (error.message || error.Code || '未知错误') });
  }
});

module.exports = router;
