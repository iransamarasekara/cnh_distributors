const db = require("../models");
const DailySales = db.DailySales;
const { Op } = require("sequelize");

exports.getAllDailySales = async (req, res) => {
  try {
    const dailySales = await DailySales.findAll();
    res.status(200).json(dailySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDailySalesById = async (req, res) => {
  try {
    const { id } = req.params;
    const dailySales = await DailySales.findOne({
      where: { sales_id: id },
    });
    if (dailySales) {
      res.status(200).json(dailySales);
    } else {
      res
        .status(404)
        .json({ message: `Daily sales record with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDailySales = async (req, res) => {
  try {
    const {
      sales_date,
      lorry_id,
      product_id,
      units_sold,
      sales_income,
      gross_profit,
    } = req.body;

    const newDailySales = await DailySales.create({
      sales_date: sales_date || new Date(),
      lorry_id,
      product_id,
      units_sold,
      sales_income,
      gross_profit,
    });

    res.status(201).json(newDailySales);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create daily sales record",
    });
  }
};

exports.updateDailySales = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await DailySales.update(req.body, {
      where: { sales_id: id },
    });
    if (updated) {
      const updatedDailySales = await DailySales.findOne({
        where: { sales_id: id },
      });
      return res.status(200).json(updatedDailySales);
    }
    throw new Error("Daily sales record not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteDailySales = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await DailySales.destroy({
      where: { sales_id: id },
    });
    if (deleted) {
      return res.status(204).send("Daily sales record deleted");
    }
    throw new Error("Daily sales record not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getDailySalesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const dailySales = await DailySales.findAll({
      where: {
        sales_date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
    });
    res.status(200).json(dailySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDailySalesByLorryId = async (req, res) => {
  try {
    const { lorryId } = req.params;
    const dailySales = await DailySales.findAll({
      where: { lorry_id: lorryId },
    });
    res.status(200).json(dailySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDailySalesByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const dailySales = await DailySales.findAll({
      where: { product_id: productId },
    });
    res.status(200).json(dailySales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
