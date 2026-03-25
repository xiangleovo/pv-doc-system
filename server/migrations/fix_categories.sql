-- 修改 categories 表,将 parentId 的默认值改为 NULL

-- 1. 删除现有的外键约束
ALTER TABLE categories DROP FOREIGN KEY categories_ibfk_1;

-- 2. 将现有的 parentId = 0 的记录更新为 NULL
UPDATE categories SET parentId = NULL WHERE parentId = 0;

-- 3. 重新添加外键约束,允许 NULL 值
ALTER TABLE categories
ADD CONSTRAINT categories_parentid_foreign
FOREIGN KEY (parentId) REFERENCES categories(id)
ON DELETE CASCADE
ON UPDATE CASCADE;

-- 4. 修改 parentId 列的默认值为 NULL
ALTER TABLE categories MODIFY parentId INT DEFAULT NULL;
