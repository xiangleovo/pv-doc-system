const { Category } = require('../models');

// 获取所有分类（一级分类，无层级）
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取单个分类
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建分类
const createCategory = async (req, res) => {
  try {
    const { name, icon, sort } = req.body;

    console.log('创建分类请求体:', req.body);

    const category = await Category.create({
      name,
      icon,
      sort: sort || 0
    });

    res.json({
      success: true,
      message: '创建成功',
      data: category
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);

    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 更新分类
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, sort } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    await category.update({
      name,
      icon,
      sort: sort !== undefined ? sort : category.sort
    });

    res.json({
      success: true,
      message: '更新成功',
      data: category
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除分类
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: '分类不存在'
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
