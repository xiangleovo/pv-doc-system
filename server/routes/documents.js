const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleFavorite,
  getFavorites,
  recordView,
  getViewCount
} = require('../controllers/documentController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// ─── 公开路由（无需认证）─────────────────────────────
router.get('/', getDocuments);
router.get('/favorites/list', authMiddleware, getFavorites);

// ─── 需要认证的静态路径（必须在 /:id 动态路由之前注册）─
// 否则 Express 会把 /view/record、/favorite/toggle 当成 /:id 拦截
router.post('/favorite/toggle', authMiddleware, toggleFavorite);
router.post('/view/record', authMiddleware, recordView);
router.get('/view/count', authMiddleware, getViewCount);

// 创建资料(仅管理员)
router.post('/', authMiddleware, adminAuthMiddleware, createDocument);

// ─── 动态路由（/:id 必须放最后）────────────────────────
// 获取单个资料(公开访问)
router.get('/:id', getDocumentById);
// 更新资料(仅管理员)
router.put('/:id', authMiddleware, adminAuthMiddleware, updateDocument);
// 删除资料(仅管理员)
router.delete('/:id', authMiddleware, adminAuthMiddleware, deleteDocument);

module.exports = router;
