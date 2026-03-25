const express = require('express');
const router = express.Router();
const {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// 公开访问的路由(无需认证) - 查看品牌
router.get('/', getBrands);
router.get('/:id', getBrandById);

// 需要认证的路由
router.use(authMiddleware);

// 创建品牌(仅管理员)
router.post('/', adminAuthMiddleware, createBrand);

// 更新品牌(仅管理员)
router.put('/:id', adminAuthMiddleware, updateBrand);

// 删除品牌(仅管理员)
router.delete('/:id', adminAuthMiddleware, deleteBrand);

module.exports = router;
