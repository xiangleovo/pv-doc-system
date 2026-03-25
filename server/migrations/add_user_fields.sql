-- 更新用户表结构,添加超级管理员角色和用户信息字段

-- 1. 修改role字段,添加super_admin选项
ALTER TABLE `users`
MODIFY COLUMN `role` ENUM('super_admin','admin','user') NOT NULL DEFAULT 'user'
COMMENT '角色: super_admin-超级管理员, admin-管理员, user-普通用户';

-- 2. 添加新字段
ALTER TABLE `users`
ADD COLUMN `phone` VARCHAR(20) NULL COMMENT '联系电话' AFTER `avatar`;

ALTER TABLE `users`
ADD COLUMN `email` VARCHAR(100) NULL COMMENT '邮箱' AFTER `phone`;

ALTER TABLE `users`
ADD COLUMN `status` ENUM('active','inactive') NOT NULL DEFAULT 'active' COMMENT '状态: active-启用, inactive-禁用' AFTER `email`;

ALTER TABLE `users`
ADD COLUMN `lastLoginAt` DATETIME NULL COMMENT '最后登录时间' AFTER `status`;

-- 3. 将现有的admin用户升级为super_admin
UPDATE `users`
SET `role` = 'super_admin'
WHERE `role` = 'admin' AND `username` = 'admin';

-- 4. 添加索引优化查询
CREATE INDEX `idx_role` ON `users`(`role`);
CREATE INDEX `idx_status` ON `users`(`status`);
CREATE INDEX `idx_openid` ON `users`(`openid`);

-- 5. 添加唯一索引
ALTER TABLE `users`
ADD UNIQUE INDEX `uniq_openid` (`openid`);
