const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUserStatus
} = require('../controllers/userController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// 公开访问路由(无需认证)
// 无 - 所有用户操作都需要认证

// 需要认证的路由
router.use(authMiddleware);

// 获取微信用户列表(管理员及以上可访问)
router.get('/', adminAuthMiddleware, getUsers);

// 获取用户详情(管理员及以上可访问)
router.get('/:id', adminAuthMiddleware, getUserById);

// 更新用户状态(管理员及以上可访问)
router.put('/:id/status', adminAuthMiddleware, updateUserStatus);

module.exports = router;
