module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加 categoryIds 字段到 brands 表
    await queryInterface.addColumn('brands', 'categoryIds', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
      comment: '所属分类ID数组'
    });

    // 移除 categories 表的 parentId 字段
    await queryInterface.removeColumn('categories', 'parentId');
  },

  down: async (queryInterface, Sequelize) => {
    // 回滚：移除 categoryIds 字段
    await queryInterface.removeColumn('brands', 'categoryIds');

    // 回滚：添加 parentId 字段
    await queryInterface.addColumn('categories', 'parentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: '父级分类ID'
    });
  }
};
