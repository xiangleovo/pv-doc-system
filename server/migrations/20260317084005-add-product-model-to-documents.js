'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('documents', 'productModel', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: '产品型号',
      after: 'panelType'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('documents', 'productModel');
  }
};
