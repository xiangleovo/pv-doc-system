const { Brand, Document, sequelize } = require('../models');

// 获取所有品牌（含每个品牌的资料数量，按分类统计）
const getBrands = async (req, res) => {
  try {
    // 获取所有品牌
    const brands = await Brand.findAll({
      order: [['sort', 'ASC'], ['id', 'ASC']]
    });

    // 获取每个品牌在每个分类下的资料数量
    const brandCategoryCounts = await Document.findAll({
      attributes: [
        'brandId',
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['brandId', 'categoryId'],
      raw: true
    });

    // 构建品牌-分类资料数量映射
    const countMap = {};
    brandCategoryCounts.forEach(item => {
      const brandId = item.brandId;
      const categoryId = item.categoryId;
      const count = parseInt(item.count) || 0;
      
      if (!countMap[brandId]) {
        countMap[brandId] = {};
      }
      countMap[brandId][categoryId] = count;
    });

    // 组装返回数据
    const result = brands.map(brand => {
      const brandData = brand.toJSON();
      const categoryDocCounts = {};
      let totalCount = 0;
      
      // 统计该品牌在每个分类下的资料数量
      const brandCounts = countMap[brand.id] || {};
      Object.entries(brandCounts).forEach(([categoryId, count]) => {
        categoryDocCounts[categoryId] = count;
        totalCount += count;
      });
      
      return {
        ...brandData,
        docCount: totalCount,
        categoryDocCounts
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取品牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取单个品牌
const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '品牌不存在'
      });
    }

    res.json({
      success: true,
      data: brand
    });
  } catch (error) {
    console.error('获取品牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建品牌
const createBrand = async (req, res) => {
  try {
    const { name, logo, description, categoryIds, sort } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '品牌名称不能为空'
      });
    }

    const brand = await Brand.create({
      name,
      logo,
      description,
      categoryIds: categoryIds || [],
      sort: sort || 0
    });

    res.json({
      success: true,
      message: '创建成功',
      data: brand
    });
  } catch (error) {
    console.error('创建品牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新品牌
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, description, categoryIds, sort } = req.body;

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '品牌不存在'
      });
    }

    await brand.update({
      name: name || brand.name,
      logo: logo !== undefined ? logo : brand.logo,
      description: description !== undefined ? description : brand.description,
      categoryIds: categoryIds !== undefined ? categoryIds : brand.categoryIds,
      sort: sort !== undefined ? sort : brand.sort
    });

    res.json({
      success: true,
      message: '更新成功',
      data: brand
    });
  } catch (error) {
    console.error('更新品牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除品牌
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: '品牌不存在'
      });
    }

    await brand.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除品牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};
