const express = require('express');
const router = express.Router();
const {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminController');
const { authMiddleware, adminAuthMiddleware, superAdminAuthMiddleware } = require('../middleware/auth');

// 公开访问路由(无需认证)
// 无 - 所有管理操作都需要认证

// 需要认证的路由
router.use(authMiddleware);

// 获取管理员列表(管理员及以上可访问)
router.get('/', adminAuthMiddleware, getAdmins);

// 获取单个管理员(管理员及以上可访问)
router.get('/:id', adminAuthMiddleware, getAdminById);

// 创建管理员(仅超级管理员)
router.post('/', superAdminAuthMiddleware, createAdmin);

// 更新管理员
// - 超级管理员可以修改所有管理员
// - 普通管理员不能修改超级管理员
router.put('/:id', adminAuthMiddleware, updateAdmin);

// 删除管理员(仅超级管理员)
router.delete('/:id', superAdminAuthMiddleware, deleteAdmin);

module.exports = router;
