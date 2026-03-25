const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../public/uploads/brands');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    cb(null, name + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// 上传单张图片
router.post('/image', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    // 返回图片URL
    const imageUrl = `/uploads/brands/${req.file.filename}`;

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: imageUrl,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '上传失败'
    });
  }
});

// 删除图片
router.delete('/image', authMiddleware, (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: '请提供图片URL'
      });
    }

    // 从URL中提取文件名
    const filename = path.basename(url);
    const filePath = path.join(uploadDir, filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: '删除成功'
      });
    } else {
      res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }
  } catch (error) {
    console.error('删除错误:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
});

module.exports = router;
