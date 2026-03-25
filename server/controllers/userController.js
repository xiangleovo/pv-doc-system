const { User, Favorite, Document } = require('../models');
const { Op } = require('sequelize');

// 将 avatar 相对路径补全为完整 URL
const getAvatarUrl = (avatar) => {
  if (!avatar) return '';
  if (avatar.startsWith('http')) return avatar;
  const baseUrl = process.env.BASE_URL || 'https://server.qqe4.com';
  return baseUrl + avatar;
};

// 获取微信用户列表
const getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, keyword, status } = req.query;

    const where = {
      role: 'user'  // 只获取微信用户
    };

    // 关键词搜索
    if (keyword) {
      where[Op.or] = [
        { nickname: { [Op.like]: `%${keyword}%` } },
        { phone: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'username', 'nickname', 'avatar', 'phone', 'email', 'status', 'lastLoginAt', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(pageSize),
      offset: (parseInt(page) - 1) * parseInt(pageSize)
    });

    // 为每个用户添加收藏统计
    const usersWithStats = await Promise.all(
      rows.map(async (user) => {
        const favoriteCount = await Favorite.count({
          where: { userId: user.id }
        });

        const userData = user.toJSON();
        return {
          ...userData,
          avatar: getAvatarUrl(userData.avatar),
          favoriteCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        list: usersWithStats,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户详情
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'nickname', 'avatar', 'phone', 'email', 'status', 'lastLoginAt', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户的收藏列表
    const favorites = await Favorite.findAll({
      where: { userId: id },
      include: [
        {
          model: Document,
          as: 'document',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    const userData = user.toJSON();
    res.json({
      success: true,
      data: {
        ...userData,
        avatar: getAvatarUrl(userData.avatar),
        favorites: favorites.map(f => f.document),
        favoriteCount: favorites.length
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新用户状态
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证状态值
    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({
        success: false,
        message: '状态值无效'
      });
    }

    await user.update({ status });

    res.json({
      success: true,
      message: '更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus
};
