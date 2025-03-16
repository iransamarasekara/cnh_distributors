"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, remove the product_id column from DailySales
    await queryInterface.removeColumn("DailySales", "product_id");

    // Then create the new DailySalesDetail table
    await queryInterface.createTable("DailySalesDetails", {
      sales_detail_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      sales_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "DailySales",
          key: "sales_id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "product_id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      units_sold: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      sales_income: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      gross_profit: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the DailySalesDetails table
    await queryInterface.dropTable("DailySalesDetails");

    // Add back the product_id column to DailySales
    await queryInterface.addColumn("DailySales", "product_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Products",
        key: "product_id",
      },
    });
  },
};
