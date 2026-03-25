-- 性能优化索引
-- 执行方式: mysql -u root -p pv-server < indexes.sql
-- 或者在 MySQL 客户端中直接执行

-- ───────────────────────────────────────────────────────────
-- 文档表索引（核心查询优化）
-- ───────────────────────────────────────────────────────────

-- 按分类查询文档
CREATE INDEX IF NOT EXISTS idx_documents_categoryId ON documents(categoryId);

-- 按品牌查询文档
CREATE INDEX IF NOT EXISTS idx_documents_brandId ON documents(brandId);

-- 标题搜索优化
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title(100));

-- 排序优化：排序字段 + 创建时间
CREATE INDEX IF NOT EXISTS idx_documents_sort ON documents(sort, id DESC);
CREATE INDEX IF NOT EXISTS idx_documents_createdAt ON documents(createdAt DESC);

-- 浏览量排序优化
CREATE INDEX IF NOT EXISTS idx_documents_views ON documents(views DESC, id DESC);

-- ───────────────────────────────────────────────────────────
-- 用户表索引
-- ───────────────────────────────────────────────────────────

-- 微信登录查询（已有 openid 索引，确认一下）
-- CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

-- 用户状态筛选
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- ───────────────────────────────────────────────────────────
-- 收藏表索引
-- ───────────────────────────────────────────────────────────

-- 用户收藏列表查询（高频）
CREATE INDEX IF NOT EXISTS idx_favorites_userId ON favorites(userId, createdAt DESC);

-- 文档收藏数统计
CREATE INDEX IF NOT EXISTS idx_favorites_documentId ON favorites(documentId);

-- ───────────────────────────────────────────────────────────
-- 浏览记录索引
-- ───────────────────────────────────────────────────────────

-- 用户浏览记录查询
CREATE INDEX IF NOT EXISTS idx_viewlogs_userId ON view_logs(userId, createdAt DESC);

-- 文档浏览数统计
CREATE INDEX IF NOT EXISTS idx_viewlogs_documentId ON view_logs(documentId);

-- ───────────────────────────────────────────────────────────
-- 验证索引是否生效
-- ───────────────────────────────────────────────────────────

-- 查看某表的索引:
-- SHOW INDEX FROM documents;
-- SHOW INDEX FROM favorites;
-- SHOW INDEX FROM view_logs;

-- 分析查询性能:
-- EXPLAIN SELECT * FROM documents WHERE categoryId = 1 ORDER BY sort ASC, id DESC LIMIT 20;
