const db = require("../models");
const StockInventory = db.StockInventory;

exports.getAllStockInventory = async (req, res) => {
  try {
    const stockInventory = await StockInventory.findAll();
    res.status(200).json(stockInventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStockInventoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const stockInventory = await StockInventory.findOne({
      where: { inventory_id: id },
    });
    if (stockInventory) {
      res.status(200).json(stockInventory);
    } else {
      res
        .status(404)
        .json({ message: `Stock inventory record with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStockInventory = async (req, res) => {
  try {
    const {
      product_id,
      cases_qty,
      bottles_qty,
      total_bottles,
      total_value,
      last_updated,
    } = req.body;

    // Check if inventory for this product already exists
    const existingInventory = await StockInventory.findOne({
      where: { product_id },
    });

    if (existingInventory) {
      return res.status(400).json({
        message: `Inventory for product ID ${product_id} already exists. Use update endpoint instead.`,
      });
    }

    const newStockInventory = await StockInventory.create({
      product_id,
      cases_qty,
      bottles_qty,
      total_bottles,
      total_value,
      last_updated: last_updated || new Date(),
    });

    res.status(201).json(newStockInventory);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create stock inventory record",
    });
  }
};

exports.updateStockInventory = async (req, res) => {
  try {
    const { id } = req.params;
    // Always update the last_updated timestamp
    const dataToUpdate = {
      ...req.body,
      last_updated: new Date(),
    };

    const [updated] = await StockInventory.update(dataToUpdate, {
      where: { inventory_id: id },
    });

    if (updated) {
      const updatedStockInventory = await StockInventory.findOne({
        where: { inventory_id: id },
      });
      return res.status(200).json(updatedStockInventory);
    }
    throw new Error("Stock inventory record not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteStockInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await StockInventory.destroy({
      where: { inventory_id: id },
    });
    if (deleted) {
      return res.status(204).send("Stock inventory record deleted");
    }
    throw new Error("Stock inventory record not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getStockInventoryByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const stockInventory = await StockInventory.findOne({
      where: { product_id: productId },
    });

    if (stockInventory) {
      res.status(200).json(stockInventory);
    } else {
      res
        .status(404)
        .json({
          message: `Stock inventory for product ID ${productId} not found`,
        });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cases_qty,
      bottles_qty,
      adjustment_reason,
      adjustment_type,
      reference_number,
    } = req.body;

    // Find the current inventory record
    const stockInventory = await StockInventory.findOne({
      where: { inventory_id: id },
    });

    if (!stockInventory) {
      return res.status(404).json({
        message: `Stock inventory record with id ${id} not found`,
      });
    }

    // Store previous values for transaction record
    const previousCasesQty = stockInventory.cases_qty;
    const previousBottlesQty = stockInventory.bottles_qty;
    const previousTotalBottles = stockInventory.total_bottles;
    const previousTotalValue = stockInventory.total_value;

    // Start a transaction
    const t = await db.sequelize.transaction();

    try {
      // Calculate new values
      const newCasesQty =
        cases_qty !== undefined ? cases_qty : stockInventory.cases_qty;
      const newBottlesQty =
        bottles_qty !== undefined ? bottles_qty : stockInventory.bottles_qty;

      // Assuming you have a way to calculate bottles per case and value per bottle
      // You might want to fetch this from Products table or pass it in the request
      const bottlesPerCase = stockInventory.bottles_per_case || 12; // Default value if not available
      const valuePerBottle =
        stockInventory.value_per_bottle ||
        stockInventory.total_value / stockInventory.total_bottles;

      const newTotalBottles = newCasesQty * bottlesPerCase + newBottlesQty;
      const newTotalValue = newTotalBottles * valuePerBottle;

      // Update the inventory
      const updatedInventory = await stockInventory.update(
        {
          cases_qty: newCasesQty,
          bottles_qty: newBottlesQty,
          total_bottles: newTotalBottles,
          total_value: newTotalValue,
          last_updated: new Date(),
        },
        { transaction: t }
      );

      // Create a transaction record if InventoryTransaction model exists

      // Commit the transaction
      await t.commit();

      res.status(200).json(updatedInventory);
    } catch (error) {
      // Rollback the transaction in case of error
      await t.rollback();
      throw error;
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to update stock quantity",
    });
  }
};
