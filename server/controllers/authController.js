const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { User } = require('../models');

// 将 avatar 相对路径补全为完整 URL
// req 可选：传入时优先用请求的 host（开发环境局域网可访问），不传则用 BASE_URL
const getAvatarUrl = (avatar, req) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  // 开发环境：用请求来源的 host，让手机/真机也能访问同一局域网地址
  if (req && process.env.NODE_ENV !== 'production') {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3001';
    return `${protocol}://${host}${avatar}`;
  }
  const baseUrl = process.env.BASE_URL || 'https://server.qqe4.com';
  return baseUrl + avatar;
};

// 管理员登录
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '无管理员权限' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: { token, user: { id: user.id, username: user.username, role: user.role } }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 将手机号格式化为昵称：138****5678
const formatPhoneNickname = (phone) => {
  if (!phone || phone.length < 7) return '微信用户';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

// 小程序登录（支持手机号授权）
const wxLogin = async (req, res) => {
  try {
    const { code, phoneCode } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: '缺少登录凭证' });
    }

    // 1. 用 code 换取 openid 和 session_key
    const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WX_APPID,
        secret: process.env.WX_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, errcode, errmsg } = wxRes.data;

    if (errcode) {
      console.error('微信登录失败:', errcode, errmsg);
      return res.status(400).json({ success: false, message: `微信登录失败: ${errmsg}` });
    }

    // 2. 如果前端传来 phoneCode，调用微信接口获取手机号
    let phone = null;
    if (phoneCode) {
      try {
        // 先获取 access_token
        const tokenRes = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
          params: {
            grant_type: 'client_credential',
            appid: process.env.WX_APPID,
            secret: process.env.WX_SECRET
          }
        });

        if (tokenRes.data.access_token) {
          const phoneRes = await axios.post(
            `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenRes.data.access_token}`,
            { code: phoneCode }
          );

          if (phoneRes.data.errcode === 0) {
            phone = phoneRes.data.phone_info.phoneNumber;
          } else {
            console.error('获取手机号失败:', phoneRes.data);
          }
        }
      } catch (phoneErr) {
        console.error('手机号接口异常:', phoneErr.message);
        // 手机号获取失败不阻断登录
      }
    }

    // 3. 查找或创建用户
    let user = await User.findOne({ where: { openid } });

    if (!user) {
      // 新用户：用手机号生成默认昵称
      const defaultNickname = phone ? formatPhoneNickname(phone) : '微信用户';
      user = await User.create({
        openid,
        nickname: defaultNickname,
        avatar: '',
        phone: phone || null,
        role: 'user',
        status: 'active',
        username: 'wx_' + openid,
        password: bcrypt.hashSync('wx_default_password', 10)
      });
    } else {
      // 检查用户是否被禁用
      if (user.status === 'inactive') {
        return res.status(403).json({ success: false, message: '账号已被禁用，请联系管理员' });
      }

      // 老用户：如果这次获取到了手机号且之前没有，则更新
      const updates = {};
      if (phone && !user.phone) {
        updates.phone = phone;
        // 如果昵称还是默认的"微信用户"，也一并更新为手机号格式
        if (!user.nickname || user.nickname === '微信用户') {
          updates.nickname = formatPhoneNickname(phone);
        }
      }
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
        await user.reload();
      }
    }

    // 4. 更新最后登录时间
    await user.update({ lastLoginAt: new Date() });

    // 5. 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: getAvatarUrl(user.avatar, req),
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ success: false, message: '登录失败' });
  }
};

// 获取用户信息
const getUserInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: getAvatarUrl(user.avatar, req),
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新用户资料（昵称 + 头像 + 手机号）
const updateProfile = async (req, res) => {
  try {
    const { nickname, avatar, phone } = req.body;

    if (!nickname || !nickname.trim()) {
      return res.status(400).json({ success: false, message: '昵称不能为空' });
    }

    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const updates = {
      nickname: nickname.trim(),
      avatar: avatar || user.avatar
    };

    // 如果提供了手机号，验证并更新
    if (phone !== undefined) {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (phone && !phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: '手机号格式不正确' });
      }
      updates.phone = phone || null;
    }

    await user.update(updates);

    res.json({
      success: true,
      message: '资料更新成功',
      data: {
        id: user.id,
        nickname: user.nickname,
        avatar: getAvatarUrl(user.avatar, req),
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = { adminLogin, wxLogin, getUserInfo, updateProfile };
