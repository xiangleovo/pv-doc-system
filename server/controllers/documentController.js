const { Document, Category, Brand, Favorite, ViewLog } = require('../models');
const { Op } = require('sequelize');

// 获取资料列表
const getDocuments = async (req, res) => {
  try {
    const { categoryId, brandId, keyword, page = 1, pageSize = 10, sortBy } = req.query;

    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (keyword) {
      where[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { '$brand.name$': { [Op.like]: `%${keyword}%` } },
        { productModel: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 处理排序
    const { sequelize } = require('../models');
    let order = [['sort', 'ASC'], ['id', 'DESC']];
    if (sortBy === 'views') {
      order = [['views', 'DESC'], ['sort', 'ASC'], ['id', 'DESC']];
    } else if (sortBy === 'title') {
      // CONVERT ... USING gbk 让 MySQL 按汉字拼音首字母排序
      order = [[sequelize.literal('CONVERT(title USING gbk)'), 'ASC'], ['id', 'ASC']];
    }

    const { count, rows } = await Document.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'logo'],
          required: false
        }
      ],
      order,
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      subQuery: false
    });

    res.json({
      success: true,
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取资料列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取单个资料
const getDocumentById = async (req, res) => {
  try {
    // 严格确保 id 是正整数（兼容 Android 传递的各种格式）
    const idStr = String(req.params.id).trim();
    const id = Math.floor(Number(idStr));

    // 严格的 ID 校验：必须是正整数
    if (isNaN(id) || id <= 0 || String(id) !== idStr) {
      console.log('无效的资料ID:', req.params.id, '解析后:', id);
      return res.status(400).json({
        success: false,
        message: '无效的资料ID'
      });
    }

    console.log('查询资料, id:', id, '原始:', req.params.id);

    const document = await Document.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'logo']
        }
      ]
    });

    if (!document) {
      console.log('资料未找到, id:', id);
      return res.status(404).json({
        success: false,
        message: '资料不存在'
      });
    }

    // 增加浏览次数
    await document.increment('views');

    // Sequelize 返回的是实例，需要转成 plain 对象
    const plainDoc = document.get ? document.get({ plain: true }) : document;
    console.log('返回资料数据, id:', plainDoc.id, 'category:', plainDoc.category);

    res.json({
      success: true,
      data: plainDoc
    });
  } catch (error) {
    console.error('获取资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建资料
const createDocument = async (req, res) => {
  try {
    const { categoryId, brandId, title, pdfUrl, panelType, productModel, thumbnail, sort } = req.body;

    if (!categoryId || !title || !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: '分类、标题和PDF链接不能为空'
      });
    }

    const document = await Document.create({
      categoryId,
      brandId,
      title,
      pdfUrl,
      panelType: panelType || 'both',
      productModel,
      thumbnail,
      sort: sort || 0
    });

    res.json({
      success: true,
      message: '创建成功',
      data: document
    });
  } catch (error) {
    console.error('创建资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新资料
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, brandId, title, pdfUrl, panelType, productModel, thumbnail, sort } = req.body;

    // 严格确保 id 是正整数
    const idStr = String(id).trim();
    const parsedId = Math.floor(Number(idStr));
    if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== idStr) {
      return res.status(400).json({
        success: false,
        message: '无效的资料ID'
      });
    }

    const document = await Document.findByPk(parsedId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: '资料不存在'
      });
    }

    await document.update({
      categoryId: categoryId || document.categoryId,
      brandId: brandId !== undefined ? brandId : document.brandId,
      title: title || document.title,
      pdfUrl: pdfUrl || document.pdfUrl,
      panelType: panelType || document.panelType,
      productModel: productModel !== undefined ? productModel : document.productModel,
      thumbnail: thumbnail !== undefined ? thumbnail : document.thumbnail,
      sort: sort !== undefined ? sort : document.sort
    });

    console.log('更新资料成功, id:', parsedId);

    res.json({
      success: true,
      message: '更新成功',
      data: document
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除资料
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // 严格确保 id 是正整数
    const idStr = String(id).trim();
    const parsedId = Math.floor(Number(idStr));
    if (isNaN(parsedId) || parsedId <= 0 || String(parsedId) !== idStr) {
      return res.status(400).json({
        success: false,
        message: '无效的资料ID'
      });
    }

    const document = await Document.findByPk(parsedId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: '资料不存在'
      });
    }

    // 先删除相关的收藏记录和浏览记录
    await Favorite.destroy({ where: { documentId: parsedId } });
    const { ViewLog } = require('../models');
    await ViewLog.destroy({ where: { documentId: parsedId } });

    await document.destroy();

    console.log('删除资料成功, id:', parsedId);

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除资料错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 收藏资料
const toggleFavorite = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.userId;

    const existing = await Favorite.findOne({
      where: { userId, documentId }
    });

    if (existing) {
      await existing.destroy();
      res.json({
        success: true,
        message: '取消收藏成功',
        data: { isFavorite: false }
      });
    } else {
      await Favorite.create({ userId, documentId });
      res.json({
        success: true,
        message: '收藏成功',
        data: { isFavorite: true }
      });
    }
  } catch (error) {
    console.error('收藏操作错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户的收藏列表
const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Document,
          as: 'document',
          include: [
            { model: Category, as: 'category' },
            { model: Brand, as: 'brand' }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: favorites.map(f => f.document)
    });
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 记录用户浏览（去重，同一用户同一资料只记一次）
const recordView = async (req, res) => {
  try {
    const { documentId } = req.body;
    const userId = req.userId;

    if (!documentId) {
      return res.status(400).json({ success: false, message: '缺少 documentId' });
    }

    // upsert：已存在则忽略，不存在则插入
    await ViewLog.findOrCreate({ where: { userId, documentId } });

    res.json({ success: true });
  } catch (error) {
    console.error('记录浏览失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 查询当前用户浏览过的资料数量
const getViewCount = async (req, res) => {
  try {
    const userId = req.userId;
    const count = await ViewLog.count({ where: { userId } });
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('查询浏览数失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

module.exports = {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  toggleFavorite,
  getFavorites,
  recordView,
  getViewCount
};
