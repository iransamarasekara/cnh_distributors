"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Shop extends Model {
    static associate(models) {
      // Shop has many Discounts
      Shop.hasMany(models.Discount, {
        foreignKey: "shop_id",
        as: "discounts",
      });
    }
  }

  Shop.init(
    {
      shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      shop_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discount_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      max_discounted_cases: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Shop",
      tableName: "Shops",
      timestamps: true,
      underscored: true,
    }
  );

  return Shop;
};
