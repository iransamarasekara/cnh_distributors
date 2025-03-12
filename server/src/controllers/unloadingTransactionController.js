const db = require("../models");
const UnloadingTransaction = db.UnloadingTransaction;

exports.getAllUnloadingTransactions = async (req, res) => {
  try {
    const unloadingTransactions = await UnloadingTransaction.findAll();
    res.status(200).json(unloadingTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnloadingTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const unloadingTransaction = await UnloadingTransaction.findOne({
      where: { unloading_id: id },
    });
    if (unloadingTransaction) {
      res.status(200).json(unloadingTransaction);
    } else {
      res
        .status(404)
        .json({ message: `Unloading transaction with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUnloadingTransaction = async (req, res) => {
  try {
    // Start a transaction to ensure consistency
    const result = await db.sequelize.transaction(async (t) => {
      const {
        lorry_id,
        unloading_date,
        unloading_time,
        unloaded_by,
        status,
        unloadingDetails, // Array of unloading details if provided
      } = req.body;

      // Create the unloading transaction
      const newUnloadingTransaction = await UnloadingTransaction.create(
        {
          lorry_id,
          unloading_date: unloading_date || new Date(),
          unloading_time:
            unloading_time || new Date().toTimeString().split(" ")[0],
          unloaded_by,
          status: status || "Pending",
        },
        { transaction: t }
      );

      // Create associated unloading details if provided
      let newUnloadingDetails = [];
      if (unloadingDetails && unloadingDetails.length > 0) {
        const detailsToCreate = unloadingDetails.map((detail) => ({
          unloading_id: newUnloadingTransaction.unloading_id,
          product_id: detail.product_id,
          cases_returned: detail.cases_returned,
          bottles_returned: detail.bottles_returned,
          total_bottles_returned: detail.total_bottles_returned,
          value: detail.value,
        }));

        newUnloadingDetails = await db.UnloadingDetail.bulkCreate(
          detailsToCreate,
          {
            transaction: t,
          }
        );
      }

      return {
        unloadingTransaction: newUnloadingTransaction,
        unloadingDetails: newUnloadingDetails,
      };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create unloading transaction",
    });
  }
};

exports.updateUnloadingTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await UnloadingTransaction.update(req.body, {
      where: { unloading_id: id },
    });
    if (updated) {
      const updatedUnloadingTransaction = await UnloadingTransaction.findOne({
        where: { unloading_id: id },
      });
      return res.status(200).json(updatedUnloadingTransaction);
    }
    throw new Error("Unloading transaction not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteUnloadingTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UnloadingTransaction.destroy({
      where: { unloading_id: id },
    });
    if (deleted) {
      return res.status(204).send("Unloading transaction deleted");
    }
    throw new Error("Unloading transaction not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUnloadingTransactionsByLorryId = async (req, res) => {
  try {
    const { lorryId } = req.params;
    const unloadingTransactions = await UnloadingTransaction.findAll({
      where: { lorry_id: lorryId },
    });
    res.status(200).json(unloadingTransactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
