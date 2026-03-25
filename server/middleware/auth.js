const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    // 校验用户状态（仅对普通用户，管理员不校验）
    if (req.userRole === 'user') {
      const user = await User.findByPk(req.userId, {
        attributes: ['status']
      });
      if (user && user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: '账号已被禁用，请联系管理员'
        });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证令牌无效或已过期'
    });
  }
};

// 管理员权限验证(包括超级管理员和普通管理员)
const adminAuthMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// 超级管理员权限验证
const superAdminAuthMiddleware = (req, res, next) => {
  if (req.userRole !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '需要超级管理员权限'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminAuthMiddleware,
  superAdminAuthMiddleware
};
