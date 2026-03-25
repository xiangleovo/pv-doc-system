const { Config } = require('../models');

// 获取所有配置
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await Config.findAll({
      order: [['key', 'ASC']]
    });
    res.json({
      success: true,
      data: configs
    });
  } catch (error) {
    console.error('获取配置列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置列表失败'
    });
  }
};

// 获取单个配置
exports.getConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await Config.findOne({ where: { key } });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: '配置项不存在'
      });
    }
    
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('获取配置失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置失败'
    });
  }
};

// 获取配置值（公开接口，无需认证）
exports.getConfigValue = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await Config.findOne({ where: { key } });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: '配置项不存在'
      });
    }
    
    res.json({
      success: true,
      data: {
        key: config.key,
        value: config.value
      }
    });
  } catch (error) {
    console.error('获取配置值失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置值失败'
    });
  }
};

// 获取多个配置值（公开接口，无需认证）
exports.getConfigValues = async (req, res) => {
  try {
    const { keys } = req.query;
    
    if (!keys) {
      return res.status(400).json({
        success: false,
        message: '请提供配置键名列表'
      });
    }
    
    const keyList = keys.split(',');
    const configs = await Config.findAll({
      where: {
        key: keyList
      }
    });
    
    const result = {};
    configs.forEach(config => {
      result[config.key] = config.value;
    });
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取配置值失败:', error);
    res.status(500).json({
      success: false,
      message: '获取配置值失败'
    });
  }
};

// 创建或更新配置
exports.upsertConfig = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: '配置键名不能为空'
      });
    }
    
    // 查找或创建配置
    let config = await Config.findOne({ where: { key } });
    
    if (config) {
      // 更新
      await config.update({
        value: value !== undefined ? value : config.value,
        description: description !== undefined ? description : config.description
      });
    } else {
      // 创建
      config = await Config.create({
        key,
        value,
        description
      });
    }
    
    res.json({
      success: true,
      message: config ? '配置已更新' : '配置已创建',
      data: config
    });
  } catch (error) {
    console.error('保存配置失败:', error);
    res.status(500).json({
      success: false,
      message: '保存配置失败'
    });
  }
};

// 删除配置
exports.deleteConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await Config.findOne({ where: { key } });
    
    if (!config) {
      return res.status(404).json({
        success: false,
        message: '配置项不存在'
      });
    }
    
    await config.destroy();
    
    res.json({
      success: true,
      message: '配置已删除'
    });
  } catch (error) {
    console.error('删除配置失败:', error);
    res.status(500).json({
      success: false,
      message: '删除配置失败'
    });
  }
};
