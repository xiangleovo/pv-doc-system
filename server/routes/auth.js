const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const COS = require('cos-nodejs-sdk-v5');
const { adminLogin, wxLogin, getUserInfo, updateProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 修复中文文件名乱码
const fixFileName = (name) => {
  try {
    return Buffer.from(name, 'latin1').toString('utf8');
  } catch (e) {
    return name;
  }
};

// 头像上传目录（临时存储）
const avatarDir = path.join(__dirname, '../public/uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(fixFileName(file.originalname)) || '.jpg';
    cb(null, 'avatar-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8) + ext);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 }
});

// 管理员登录
router.post('/admin/login', adminLogin);

// 小程序登录
router.post('/wx/login', wxLogin);

// 获取用户信息(需要认证)
router.get('/user/info', authMiddleware, getUserInfo);

// 更新用户资料（昵称 + 头像，需要认证）
router.put('/user/profile', authMiddleware, updateProfile);

// 通过微信授权码获取手机号（需要认证）
router.post('/wx/phone', authMiddleware, async (req, res) => {
  const { phoneCode } = req.body;

  if (!phoneCode) {
    return res.status(400).json({ success: false, message: '缺少授权码' });
  }

  try {
    // 1. 获取 access_token
    const tokenRes = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
      params: {
        grant_type: 'client_credential',
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET
      }
    });

    if (!tokenRes.data.access_token) {
      return res.status(500).json({ success: false, message: '获取微信凭证失败' });
    }

    // 2. 用 code 换取手机号
    const phoneRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenRes.data.access_token}`,
      { code: phoneCode }
    );

    if (phoneRes.data.errcode !== 0) {
      console.error('微信获取手机号失败:', phoneRes.data);
      return res.status(400).json({ success: false, message: '获取手机号失败' });
    }

    const phone = phoneRes.data.phone_info.phoneNumber;

    // 3. 更新用户手机号
    const { User } = require('../models');
    await User.update({ phone }, { where: { id: req.userId } });

    res.json({ success: true, message: '获取成功', data: { phone } });
  } catch (error) {
    console.error('获取手机号接口错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 解绑手机号（需要认证）
router.delete('/user/phone', authMiddleware, async (req, res) => {
  try {
    const { User } = require('../models');
    await User.update({ phone: null }, { where: { id: req.userId } });
    res.json({ success: true, message: '解绑成功' });
  } catch (error) {
    console.error('解绑手机号错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 上传用户头像到 COS（需要认证）
router.post('/user/avatar', authMiddleware, avatarUpload.single('avatar'), async (req, res) => {
  const tmpFile = req.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '请选择头像文件' });
    }

    const secretId = process.env.COS_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY;
    const bucket = process.env.COS_BUCKET;
    const region = process.env.COS_REGION;
    const customDomain = process.env.COS_DOMAIN || '';

    // 如果没有 COS 配置，回退到本地存储
    if (!secretId || !secretKey || !bucket || !region) {
      const relativeUrl = `/uploads/avatars/${req.file.filename}`;
      const baseUrl = process.env.BASE_URL || `https://${req.get('host')}`;
      return res.json({ success: true, data: { url: baseUrl + relativeUrl } });
    }

    const cos = new COS({ SecretId: secretId, SecretKey: secretKey });

    // 构建存储路径：avatars/用户ID/文件名
    const userId = req.user?.id || 'unknown';
    const ext = path.extname(req.file.filename) || '.jpg';
    const cosKey = `avatars/${userId}/${Date.now()}${ext}`;

    // 上传到 COS
    await new Promise((resolve, reject) => {
      cos.uploadFile({
        Bucket: bucket,
        Region: region,
        Key: cosKey,
        FilePath: tmpFile,
        ContentType: req.file.mimetype || 'image/jpeg'
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

    res.json({ success: true, data: { url: fileUrl } });
  } catch (error) {
    // 清理临时文件
    if (tmpFile && fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
    }
    console.error('头像上传到 COS 失败:', error);
    res.status(500).json({ success: false, message: '上传失败: ' + (error.message || error.Code || '未知错误') });
  }
});

module.exports = router;

