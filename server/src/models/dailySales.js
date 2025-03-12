"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DailySales extends Model {
    static associate(models) {
      // DailySales belongs to one Lorry
      DailySales.belongsTo(models.Lorry, {
        foreignKey: "lorry_id",
        as: "lorry",
      });

      // DailySales belongs to one Product
      DailySales.belongsTo(models.Product, {
        foreignKey: "product_id",
        as: "product",
      });
    }
  }

  DailySales.init(
    {
      sales_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      sales_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      lorry_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Lorries",
          key: "lorry_id",
        },
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Products",
          key: "product_id",
        },
      },
      units_sold: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sales_income: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      gross_profit: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "DailySales",
      tableName: "DailySales",
      timestamps: true,
      underscored: true,
    }
  );

  return DailySales;
};
