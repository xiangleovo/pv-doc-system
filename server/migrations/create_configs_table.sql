-- 创建系统配置表
CREATE TABLE IF NOT EXISTS configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(50) NOT NULL COMMENT '配置项键名',
  `value` TEXT COMMENT '配置项值',
  description VARCHAR(255) COMMENT '配置项描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 插入默认配置：联系电话
INSERT INTO configs (`key`, `value`, `description`) VALUES
('contact_phone', '13225566869', '小程序端显示的联系电话');

-- 插入默认配置：公司名称
INSERT INTO configs (`key`, `value`, `description`) VALUES
('company_name', '安徽中浩能源电力有限公司', '小程序端显示的公司名称');
