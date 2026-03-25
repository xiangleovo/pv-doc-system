const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// 公开访问的路由(无需认证)
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// 需要认证的路由
router.use(authMiddleware);

// 创建分类(仅管理员)
router.post('/', adminAuthMiddleware, createCategory);

// 更新分类(仅管理员)
router.put('/:id', adminAuthMiddleware, updateCategory);

// 删除分类(仅管理员)
router.delete('/:id', adminAuthMiddleware, deleteCategory);

module.exports = router;
