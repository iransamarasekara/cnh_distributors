const db = require("../models");
const LoadingTransaction = db.LoadingTransaction;

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
  try {
    // Start a transaction to ensure consistency
    const result = await db.sequelize.transaction(async (t) => {
      const {
        lorry_id,
        loading_date,
        loading_time,
        loaded_by,
        status,
        loadingDetails, // Array of loading details if provided
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
        { transaction: t }
      );

      // Create associated loading details if provided
      let newLoadingDetails = [];
      if (loadingDetails && loadingDetails.length > 0) {
        const detailsToCreate = loadingDetails.map((detail) => ({
          loading_id: newLoadingTransaction.loading_id,
          product_id: detail.product_id,
          cases_loaded: detail.cases_loaded,
          bottles_loaded: detail.bottles_loaded,
          total_bottles_loaded: detail.total_bottles_loaded,
          value: detail.value,
        }));

        newLoadingDetails = await db.LoadingDetail.bulkCreate(detailsToCreate, {
          transaction: t,
        });
      }

      return {
        loadingTransaction: newLoadingTransaction,
        loadingDetails: newLoadingDetails,
      };
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create loading transaction",
    });
  }
};

exports.updateLoadingTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await LoadingTransaction.update(req.body, {
      where: { loading_id: id },
    });
    if (updated) {
      const updatedLoadingTransaction = await LoadingTransaction.findOne({
        where: { loading_id: id },
      });
      return res.status(200).json(updatedLoadingTransaction);
    }
    throw new Error("Loading transaction not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
