"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubDiscountType extends Model {
    static associate(models) {
      // SubDiscountType has many Discounts
      SubDiscountType.hasMany(models.Discount, {
        foreignKey: "sub_discount_type_id",
        as: "discounts",
      });
    }
  }

  SubDiscountType.init(
    {
      sub_discount_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      sub_discount_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discount_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "SubDiscountType",
      tableName: "SubDiscountTypes",
      timestamps: true,
      underscored: true,
    }
  );

  return SubDiscountType;
};
