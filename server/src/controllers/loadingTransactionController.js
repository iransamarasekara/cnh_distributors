const db = require("../models");
const LoadingTransaction = db.LoadingTransaction;
const LoadingDetail = db.LoadingDetail;
const StockInventory = db.StockInventory;
const InventoryTransaction = db.InventoryTransaction;

exports.getAllLoadingTransactions = async (req, res) => {
  try {
    const loadingTransactions = await LoadingTransaction.findAll();
    res.status(200).json(loadingTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLoadingTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const loadingTransaction = await LoadingTransaction.findOne({
      where: { loading_id: id },
    });
    if (loadingTransaction) {
      res.status(200).json(loadingTransaction);
    } else {
      res
        .status(404)
        .json({ message: `Loading transaction with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLoadingTransaction = async (req, res) => {
  // Start a database transaction to ensure all operations succeed or fail together
  const dbTransaction = await db.sequelize.transaction();

  try {
    const {
      lorry_id,
      loading_date,
      loading_time,
      loaded_by,
      status,
      loadingDetails, // Array of loading details
    } = req.body;

    // Create the loading transaction
    const newLoadingTransaction = await LoadingTransaction.create(
      {
        lorry_id,
        loading_date: loading_date || new Date(),
        loading_time: loading_time || new Date().toTimeString().split(" ")[0],
        loaded_by,
        status: status || "Pending",
      },
      { transaction: dbTransaction }
    );

    // Process loading details and update inventory
    let newLoadingDetails = [];

    if (loadingDetails && loadingDetails.length > 0) {
      // Process each product being loaded
      for (const detail of loadingDetails) {
        // Find current inventory for this product
        const stockInventory = await StockInventory.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        if (!stockInventory) {
          throw new Error(
            `No inventory found for product ID: ${detail.product_id}`
          );
        }

        // Calculate new inventory quantities
        const newCasesQty = stockInventory.cases_qty - detail.cases_loaded;
        const newBottlesQty =
          stockInventory.bottles_qty - detail.bottles_loaded;

        // Validate that we have enough stock
        if (newCasesQty < 0 || newBottlesQty < 0) {
          throw new Error(
            `Insufficient stock for product ID: ${detail.product_id}`
          );
        }

        // Calculate total bottles and value
        const bottlesPerCase = stockInventory.bottles_per_case || 12; // Default or get from product
        const newTotalBottles = newCasesQty * bottlesPerCase + newBottlesQty;

        // Calculate value per bottle (if total_bottles is 0, use a fallback to avoid division by zero)
        const valuePerBottle =
          stockInventory.total_bottles > 0
            ? stockInventory.total_value / stockInventory.total_bottles
            : 0;

        const newTotalValue = newTotalBottles * valuePerBottle;

        // Update the inventory
        await stockInventory.update(
          {
            cases_qty: newCasesQty,
            bottles_qty: newBottlesQty,
            total_bottles: newTotalBottles,
            total_value: newTotalValue,
            last_updated: new Date(),
          },
          { transaction: dbTransaction }
        );

        // Record the transaction regardless of whether it's a new or existing inventory
        await InventoryTransaction.create(
          {
            product_id: detail.product_id,
            transaction_type: "REMOVE", // Both are ADD but logically different
            cases_qty: detail.cases_loaded,
            bottles_qty: detail.bottles_loaded,
            total_bottles:
              detail.cases_loaded * bottlesPerCase + detail.bottles_loaded,
            total_value:
              (detail.cases_loaded * bottlesPerCase + detail.bottles_loaded) *
              valuePerBottle,
            notes: "Loading transaction",
            transaction_date: new Date(),
          },
          { transaction: dbTransaction }
        );

        // Create the loading detail record
        const newDetail = await LoadingDetail.create(
          {
            loading_id: newLoadingTransaction.loading_id,
            product_id: detail.product_id,
            cases_loaded: detail.cases_loaded,
            bottles_loaded: detail.bottles_loaded,
            total_bottles_loaded:
              detail.cases_loaded * bottlesPerCase + detail.bottles_loaded,
            value:
              (detail.cases_loaded * bottlesPerCase + detail.bottles_loaded) *
              valuePerBottle,
          },
          { transaction: dbTransaction }
        );

        newLoadingDetails.push(newDetail);
      }
    }

    // Commit the transaction if everything succeeded
    await dbTransaction.commit();

    res.status(201).json({
      loadingTransaction: newLoadingTransaction,
      loadingDetails: newLoadingDetails,
    });
  } catch (error) {
    // Rollback all changes if anything fails
    await dbTransaction.rollback();

    res.status(500).json({
      error: error.message,
      message: "Failed to create loading transaction or update inventory",
    });
  }
};

exports.updateLoadingTransaction = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, loadingDetails } = req.body;

    // Get the current loading transaction
    const loadingTransaction = await LoadingTransaction.findOne({
      where: { loading_id: id },
      transaction: dbTransaction,
    });

    if (!loadingTransaction) {
      throw new Error(`Loading transaction with id ${id} not found`);
    }

    // Update the loading transaction status
    await loadingTransaction.update(
      { ...req.body },
      { transaction: dbTransaction }
    );

    // If the status is changing to "Cancelled", we need to return items to inventory
    if (status === "Cancelled") {
      // Get all loading details for this transaction
      const details = await LoadingDetail.findAll({
        where: { loading_id: id },
        transaction: dbTransaction,
      });

      // Return each product to inventory
      for (const detail of details) {
        const inventory = await StockInventory.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        if (inventory) {
          const bottlesPerCase = inventory.bottles_per_case || 12;
          const newCasesQty = inventory.cases_qty + detail.cases_loaded;
          const newBottlesQty = inventory.bottles_qty + detail.bottles_loaded;
          const newTotalBottles = newCasesQty * bottlesPerCase + newBottlesQty;

          // Calculate value per bottle
          const valuePerBottle =
            inventory.total_bottles > 0
              ? inventory.total_value / inventory.total_bottles
              : 0;

          const newTotalValue = newTotalBottles * valuePerBottle;

          // Update inventory
          await inventory.update(
            {
              cases_qty: newCasesQty,
              bottles_qty: newBottlesQty,
              total_bottles: newTotalBottles,
              total_value: newTotalValue,
              last_updated: new Date(),
            },
            { transaction: dbTransaction }
          );
        }
      }
    }

    // If new loading details are provided, process them
    if (loadingDetails && loadingDetails.length > 0) {
      // Implementation for updating loading details would go here
      // This would be similar to the create function but would handle
      // adding/removing products and adjusting inventory accordingly
    }

    await dbTransaction.commit();

    const updatedLoadingTransaction = await LoadingTransaction.findOne({
      where: { loading_id: id },
      include: [{ model: db.LoadingDetail }],
    });

    res.status(200).json(updatedLoadingTransaction);
  } catch (error) {
    await dbTransaction.rollback();
    res.status(500).json({
      error: error.message,
      message: "Failed to update loading transaction or inventory",
    });
  }
};

exports.deleteLoadingTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LoadingTransaction.destroy({
      where: { loading_id: id },
    });
    if (deleted) {
      return res.status(204).send("Loading transaction deleted");
    }
    throw new Error("Loading transaction not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getLoadingTransactionsByLorryId = async (req, res) => {
  try {
    const { lorryId } = req.params;
    const loadingTransactions = await LoadingTransaction.findAll({
      where: { lorry_id: lorryId },
    });
    res.status(200).json(loadingTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
