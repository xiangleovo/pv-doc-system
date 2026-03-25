const { User } = require('../models');
const bcrypt = require('bcryptjs');

// 获取所有管理员(包括超级管理员和管理员)
const getAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        role: ['super_admin', 'admin']
      },
      attributes: { exclude: ['password', 'openid'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('获取管理员列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取单个管理员
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id, {
      attributes: { exclude: ['password', 'openid'] }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    if (admin.role !== 'super_admin' && admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: '该用户不是管理员'
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('获取管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建管理员(仅超级管理员)
const createAdmin = async (req, res) => {
  try {
    const { username, password, nickname, role, phone, email } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 普通管理员不能创建超级管理员
    if (req.userRole !== 'super_admin' && role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以创建超级管理员账号'
      });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建管理员
    const admin = await User.create({
      username,
      password: hashedPassword,
      nickname: nickname || username,
      role: role || 'admin',
      phone,
      email,
      status: 'active'
    });

    // 返回不包含密码的数据
    const adminData = admin.toJSON();
    delete adminData.password;
    delete adminData.openid;

    res.json({
      success: true,
      message: '创建成功',
      data: adminData
    });
  } catch (error) {
    console.error('创建管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新管理员
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nickname, role, phone, email, status } = req.body;

    const admin = await User.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 验证角色
    if (admin.role !== 'super_admin' && admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: '该用户不是管理员'
      });
    }

    // 普通管理员不能修改超级管理员
    if (req.userRole !== 'super_admin' && admin.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以修改超级管理员账号'
      });
    }

    // 不能修改自己的角色
    if (parseInt(id) === req.userId && role && role !== admin.role) {
      return res.status(403).json({
        success: false,
        message: '不能修改自己的角色'
      });
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== admin.username) {
      const existingUser = await User.findOne({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }

    // 准备更新数据
    const updateData = {};
    if (username) updateData.username = username;
    if (nickname !== undefined) updateData.nickname = nickname;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (status !== undefined) updateData.status = status;

    // 普通管理员不能修改角色
    if (req.userRole === 'super_admin' && role !== undefined) {
      updateData.role = role;
    }

    // 如果提供了新密码,进行加密
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await admin.update(updateData);

    // 返回更新后的数据
    const updatedAdmin = await User.findByPk(id, {
      attributes: { exclude: ['password', 'openid'] }
    });

    res.json({
      success: true,
      message: '更新成功',
      data: updatedAdmin
    });
  } catch (error) {
    console.error('更新管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除管理员(仅超级管理员)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await User.findByPk(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 不能删除自己
    if (parseInt(id) === req.userId) {
      return res.status(403).json({
        success: false,
        message: '不能删除自己的账号'
      });
    }

    // 验证角色
    if (admin.role !== 'super_admin' && admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: '该用户不是管理员'
      });
    }

    await admin.destroy();

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除管理员错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
