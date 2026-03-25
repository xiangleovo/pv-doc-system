const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authMiddleware, adminAuthMiddleware } = require('../middleware/auth');

// 公开接口 - 获取配置值（无需认证）
router.get('/value/:key', configController.getConfigValue);
router.get('/values', configController.getConfigValues);

// 需要管理员权限的接口
router.get('/', authMiddleware, adminAuthMiddleware, configController.getAllConfigs);
router.get('/:key', authMiddleware, adminAuthMiddleware, configController.getConfig);
router.post('/', authMiddleware, adminAuthMiddleware, configController.upsertConfig);
router.put('/', authMiddleware, adminAuthMiddleware, configController.upsertConfig);
router.delete('/:key', authMiddleware, adminAuthMiddleware, configController.deleteConfig);

module.exports = router;
