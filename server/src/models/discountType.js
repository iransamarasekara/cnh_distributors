"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DiscountType extends Model {
    static associate(models) {
      // DiscountType has many SubDiscountTypes
      DiscountType.hasMany(models.SubDiscountType, {
        foreignKey: "discount_type_id",
        as: "subDiscountTypes",
      });
    }
  }

  DiscountType.init(
    {
      discount_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      sub_discount_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DiscountType",
      tableName: "DiscountTypes",
      timestamps: true,
      underscored: true,
    }
  );

  return DiscountType;
};
