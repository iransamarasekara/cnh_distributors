"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class StockInventory extends Model {
    static associate(models) {
      // StockInventory belongs to one Product
      StockInventory.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  StockInventory.init(
    {
      inventory_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
      cases_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      bottles_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_bottles: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total_value: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      empty_cases_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      empty_bottles_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      expired_bottles_qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_expired_bottles_value: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "StockInventory",
      tableName: "StockInventory",
      timestamps: true,
      underscored: true,
    }
  );

  return StockInventory;
};
