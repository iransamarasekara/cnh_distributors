const db = require("../models");
const UnloadingTransaction = db.UnloadingTransaction;
const UnloadingDetail = db.UnloadingDetail;
const StockInventory = db.StockInventory;
const InventoryTransaction = db.InventoryTransaction;

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
  // Start a database transaction to ensure all operations succeed or fail together
  const dbTransaction = await db.sequelize.transaction();

  try {
    const {
      lorry_id,
      unloading_date,
      unloading_time,
      unloaded_by,
      status,
      unloadingDetails, // Array of unloading details
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
      { transaction: dbTransaction }
    );

    // Process unloading details and update inventory
    let newUnloadingDetails = [];

    if (unloadingDetails && unloadingDetails.length > 0) {
      // Check if an empty return record already exists for this date and lorry
      let emptyReturn = await db.EmptyReturn.findOne({
        where: {
          lorry_id: lorry_id,
          return_date: unloading_date,
        },
        transaction: dbTransaction,
      });

      // Check if an expiry return record already exists for this date and lorry
      let expiryReturn = await db.ExpiryReturn.findOne({
        where: {
          lorry_id: lorry_id,
          return_date: unloading_date,
        },
        transaction: dbTransaction,
      });

      // If no empty return record exists, create a new one
      if (!emptyReturn) {
        emptyReturn = await db.EmptyReturn.create(
          {
            lorry_id,
            return_date: unloading_date,
          },
          { transaction: dbTransaction }
        );
      }

      // If no expiry return record exists, create a new one
      if (!expiryReturn) {
        expiryReturn = await db.ExpiryReturn.create(
          {
            lorry_id,
            return_date: unloading_date,
          },
          { transaction: dbTransaction }
        );
      }

      // Process each product's empty and expiry returns
      for (const detail of unloadingDetails) {
        // Handle empty returns details
        if (detail.empty_bottles_qty > 0 || detail.empty_cases_qty > 0) {
          // Check if a detail record already exists for this product
          const existingEmptyDetail = await db.EmptyReturnsDetail.findOne({
            where: {
              empty_return_id: emptyReturn.empty_return_id,
              product_id: detail.product_id,
            },
            transaction: dbTransaction,
          });

          if (existingEmptyDetail) {
            // Update existing record
            await existingEmptyDetail.update(
              {
                empty_bottles_returned:
                  existingEmptyDetail.empty_bottles_returned +
                  (detail.empty_bottles_qty || 0),
                empty_cases_returned:
                  existingEmptyDetail.empty_cases_returned +
                  (detail.empty_cases_qty || 0),
              },
              { transaction: dbTransaction }
            );
          } else {
            // Create new record
            await db.EmptyReturnsDetail.create(
              {
                empty_return_id: emptyReturn.empty_return_id,
                product_id: detail.product_id,
                empty_bottles_returned: detail.empty_bottles_qty || 0,
                empty_cases_returned: detail.empty_cases_qty || 0,
              },
              { transaction: dbTransaction }
            );
          }
        }

        // Handle expiry returns details
        if (
          detail.expired_bottles_qty > 0 ||
          detail.expired_bottles_value > 0
        ) {
          // Check if a detail record already exists for this product
          const existingExpiryDetail = await db.ExpiryReturnsDetail.findOne({
            where: {
              expiry_return_id: expiryReturn.expiry_return_id,
              product_id: detail.product_id,
            },
            transaction: dbTransaction,
          });

          if (existingExpiryDetail) {
            // Update existing record
            await existingExpiryDetail.update(
              {
                bottles_expired:
                  existingExpiryDetail.bottles_expired +
                  (detail.expired_bottles_qty || 0),
                expiry_value:
                  existingExpiryDetail.expiry_value +
                  (detail.expired_bottles_value || 0),
              },
              { transaction: dbTransaction }
            );
          } else {
            // Create new record
            await db.ExpiryReturnsDetail.create(
              {
                expiry_return_id: expiryReturn.expiry_return_id,
                product_id: detail.product_id,
                bottles_expired: detail.expired_bottles_qty || 0,
                expiry_value: detail.expired_bottles_value || 0,
              },
              { transaction: dbTransaction }
            );
          }
        }

        // Find current inventory for this product
        const stockInventory = await StockInventory.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        const product = await db.Product.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        // If no inventory exists for this product, create a new one
        if (!stockInventory) {
          // Get product information to calculate values correctly
          const product = await db.Product.findOne({
            where: { product_id: detail.product_id },
            transaction: dbTransaction,
          });

          if (!product) {
            throw new Error(`Product with ID ${detail.product_id} not found`);
          }

          const bottlesPerCase = product.bottles_per_case;
          const totalBottles =
            detail.cases_returned * bottlesPerCase + detail.bottles_returned;
          // Calculate appropriate value based on product pricing
          const valuePerBottle = product.unit_price;

          // Create new inventory record
          await StockInventory.create(
            {
              product_id: detail.product_id,
              cases_qty: detail.cases_returned,
              bottles_qty: detail.bottles_returned,
              total_bottles: totalBottles,
              total_value: totalBottles * valuePerBottle,
              last_updated: new Date(),
            },
            { transaction: dbTransaction }
          );
        } else {
          // Calculate new inventory quantities
          const bottlesPerCase = product.bottles_per_case; // Default or get from product
          const newCasesQty = stockInventory.cases_qty + detail.cases_returned;
          const newBottlesQty =
            stockInventory.bottles_qty + detail.bottles_returned;

          // Calculate total bottles and value
          const newTotalBottles = newCasesQty * bottlesPerCase + newBottlesQty;

          // Calculate value per bottle (if total_bottles is 0, use a fallback)
          const valuePerBottle = product.unit_price;

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
        }

        // Create the unloading detail record
        const bottlesPerCase = product.bottles_per_case;
        const totalBottlesReturned =
          detail.cases_returned * bottlesPerCase + detail.bottles_returned;

        // Get value per bottle (from inventory or product)
        let valuePerBottle = product.unit_price;
        // if (stockInventory && stockInventory.total_bottles > 0) {
        //   valuePerBottle =
        //     stockInventory.total_value / stockInventory.total_bottles;
        // } else {
        //   valuePerBottle = await getProductValuePerBottle(
        //     detail.product_id,
        //     dbTransaction
        //   );
        // }

        // Record the transaction regardless of whether it's a new or existing inventory
        await InventoryTransaction.create(
          {
            product_id: detail.product_id,
            transaction_type: "ADD", // Both are ADD but logically different
            cases_qty: detail.cases_returned,
            bottles_qty: detail.bottles_returned,
            total_bottles:
              detail.cases_returned * bottlesPerCase + detail.bottles_returned,
            total_value:
              (detail.cases_returned * bottlesPerCase +
                detail.bottles_returned) *
              valuePerBottle,
            notes: "Unloading transaction",
            transaction_date: new Date(),
          },
          { transaction: dbTransaction }
        );

        const newDetail = await UnloadingDetail.create(
          {
            unloading_id: newUnloadingTransaction.unloading_id,
            product_id: detail.product_id,
            cases_returned: detail.cases_returned,
            bottles_returned: detail.bottles_returned,
            total_bottles_returned: totalBottlesReturned,
            value: totalBottlesReturned * valuePerBottle,
          },
          { transaction: dbTransaction }
        );

        newUnloadingDetails.push(newDetail);
      }
    }

    // ADDED: Update all loading transactions for this lorry to "Unloaded" state
    await db.LoadingTransaction.update(
      { status: "Unloaded" },
      {
        where: {
          lorry_id: lorry_id,
          status: { [db.Sequelize.Op.ne]: "Unloaded" }, // Only update non-unloaded transactions
        },
        transaction: dbTransaction,
      }
    );

    // ADDED: Create daily sales by comparing loading and unloading transactions
    await createDailySalesFromUnloading(
      lorry_id,
      unloading_date || new Date(),
      newUnloadingTransaction.unloading_id,
      dbTransaction
    );

    // Commit the transaction if everything succeeded
    await dbTransaction.commit();

    res.status(201).json({
      unloadingTransaction: newUnloadingTransaction,
      unloadingDetails: newUnloadingDetails,
    });
  } catch (error) {
    // Rollback all changes if anything fails
    await dbTransaction.rollback();

    res.status(500).json({
      error: error.message,
      message: "Failed to create unloading transaction or update inventory",
    });
  }
};

// New helper function to create daily sales records
// Add these debug logs to the createDailySalesFromUnloading function
async function createDailySalesFromUnloading(
  lorryId,
  unloadingDate,
  unloadingId,
  transaction
) {
  try {
    console.log(
      `Processing unloading transaction ${unloadingId} for lorry ${lorryId}`
    );

    // Get the current unloading transaction with its details
    const currentUnloadingTransaction = await db.UnloadingTransaction.findOne({
      where: { unloading_id: unloadingId },
      include: [
        {
          model: db.UnloadingDetail,
          as: "unloadingDetails",
        },
      ],
      transaction,
    });

    if (!currentUnloadingTransaction) {
      console.log(`Unloading transaction ${unloadingId} not found`);
      return;
    }

    // Find ALL loading transactions for this lorry on this date
    const loadingTransactions = await db.LoadingTransaction.findAll({
      where: {
        lorry_id: lorryId,
        loading_date: unloadingDate,
      },
      include: [
        {
          model: db.LoadingDetail,
          as: "loadingDetails",
        },
      ],
      transaction,
    });

    if (!loadingTransactions || loadingTransactions.length === 0) {
      console.log(
        `No loading transactions found for lorry ${lorryId} on ${unloadingDate}`
      );
      return;
    }

    console.log(`Found ${loadingTransactions.length} loading transactions`);

    // Combine all loading details from all transactions for this day
    const allLoadingDetails = [];
    for (const loadingTx of loadingTransactions) {
      console.log(`Processing loading transaction ID: ${loadingTx.loading_id}`);
      allLoadingDetails.push(...loadingTx.loadingDetails);
    }

    console.log(`Total loading details collected: ${allLoadingDetails.length}`);

    // Find ALL unloading transactions for this lorry on this date
    const allUnloadingTransactions = await db.UnloadingTransaction.findAll({
      where: {
        lorry_id: lorryId,
        unloading_date: unloadingDate,
      },
      include: [
        {
          model: db.UnloadingDetail,
          as: "unloadingDetails",
        },
      ],
      transaction,
    });

    console.log(
      `Found ${allUnloadingTransactions.length} unloading transactions`
    );

    // Get product information for pricing and calculations
    const productIds = new Set();

    // Add product IDs from all loading details
    allLoadingDetails.forEach((detail) => productIds.add(detail.product_id));

    // Add product IDs from all unloading transactions
    allUnloadingTransactions.forEach((unloadingTx) => {
      unloadingTx.unloadingDetails.forEach((detail) =>
        productIds.add(detail.product_id)
      );
    });

    console.log("Product IDs found:", Array.from(productIds));

    const products = await db.Product.findAll({
      where: { product_id: Array.from(productIds) },
      transaction,
    });

    const productMap = {};
    products.forEach((product) => {
      productMap[product.product_id] = product;
    });

    // Create a map to accumulate loaded quantities by product for this day
    const productLoads = {};

    // Sum up all loaded quantities from all transactions
    for (const loadDetail of allLoadingDetails) {
      const productId = loadDetail.product_id;

      if (!productLoads[productId]) {
        productLoads[productId] = {
          cases_loaded: 0,
          bottles_loaded: 0,
          total_bottles_loaded: 0,
        };
      }

      productLoads[productId].cases_loaded += loadDetail.cases_loaded || 0;
      productLoads[productId].bottles_loaded += loadDetail.bottles_loaded || 0;

      const product = productMap[productId];
      const bottlesPerCase = product ? product.bottles_per_case : 0;

      productLoads[productId].total_bottles_loaded =
        productLoads[productId].cases_loaded * bottlesPerCase +
        productLoads[productId].bottles_loaded;

      console.log(
        `Accumulated load for product ${productId}: ${productLoads[productId].cases_loaded} cases, ` +
          `${productLoads[productId].bottles_loaded} bottles, ` +
          `${productLoads[productId].total_bottles_loaded} total bottles`
      );
    }

    // Create a map to accumulate returned quantities by product for this day
    const productReturns = {};

    // Sum up all returned quantities from all unloading transactions
    for (const unloadingTx of allUnloadingTransactions) {
      for (const unloadDetail of unloadingTx.unloadingDetails) {
        const productId = unloadDetail.product_id;
        const product = productMap[productId];

        if (!product) {
          console.log(`No product found for product_id ${productId}`);
          continue;
        }

        if (!productReturns[productId]) {
          productReturns[productId] = {
            cases_returned: 0,
            bottles_returned: 0,
            total_bottles_returned: 0,
          };
        }

        productReturns[productId].cases_returned +=
          unloadDetail.cases_returned || 0;
        productReturns[productId].bottles_returned +=
          unloadDetail.bottles_returned || 0;

        const bottlesPerCase = product.bottles_per_case;

        productReturns[productId].total_bottles_returned =
          productReturns[productId].cases_returned * bottlesPerCase +
          productReturns[productId].bottles_returned;

        console.log(
          `Accumulated returns for product ${productId}: ${productReturns[productId].cases_returned} cases, ` +
            `${productReturns[productId].bottles_returned} bottles, ` +
            `${productReturns[productId].total_bottles_returned} total bottles`
        );
      }
    }

    // Create a sales record for each product
    const salesItems = [];

    // Process each product that was loaded
    for (const productId in productLoads) {
      const product = productMap[productId];

      if (!product) {
        console.log(`No product found for product_id ${productId}`);
        continue;
      }

      const loadData = productLoads[productId];
      const returnData = productReturns[productId] || {
        cases_returned: 0,
        bottles_returned: 0,
        total_bottles_returned: 0,
      };

      // Calculate units sold (bottles loaded - bottles returned)
      const unitsSold =
        loadData.total_bottles_loaded - returnData.total_bottles_returned;

      console.log(
        `Product ${productId}: Loaded ${loadData.total_bottles_loaded}, ` +
          `Returned ${returnData.total_bottles_returned}, Sold ${unitsSold}`
      );

      if (unitsSold <= 0) {
        console.log(
          `No sales for product ${productId} (unitsSold = ${unitsSold})`
        );
        continue; // No sales for this product
      }

      // Calculate sales income (units sold * selling price)
      const salesIncome = unitsSold * (product.selling_price || 0);

      // Calculate gross profit (sales income - (units sold * unit price))
      const costOfGoods = unitsSold * (product.unit_price || 0);
      const grossProfit = salesIncome - costOfGoods;

      console.log(
        `Product ${productId}: Sales Income ${salesIncome}, Gross Profit ${grossProfit}`
      );

      salesItems.push({
        product_id: parseInt(productId),
        units_sold: unitsSold,
        sales_income: salesIncome,
        gross_profit: grossProfit,
      });
    }

    console.log(`Sales items to be created: ${salesItems.length}`);

    if (salesItems.length === 0) {
      console.log("No sales to record for this unloading transaction");
      return;
    }

    // Check if a daily sales record already exists for this lorry and date
    let existingDailySales = await db.DailySales.findOne({
      where: {
        sales_date: unloadingDate,
        lorry_id: lorryId,
      },
      transaction,
    });

    // Calculate totals
    const totalUnitsSold = salesItems.reduce(
      (sum, item) => sum + item.units_sold,
      0
    );
    const totalSalesIncome = salesItems.reduce(
      (sum, item) => sum + item.sales_income,
      0
    );
    let totalGrossProfit = salesItems.reduce(
      (sum, item) => sum + item.gross_profit,
      0
    );

    // Find and sum up all expiry values for this date and lorry
    const expiryReturn = await db.ExpiryReturn.findOne({
      where: {
        lorry_id: lorryId,
        return_date: unloadingDate,
      },
      transaction,
    });

    let totalExpiryValue = 0;
    if (expiryReturn) {
      // Get all expiry details for this return
      const expiryDetails = await db.ExpiryReturnsDetail.findAll({
        where: {
          expiry_return_id: expiryReturn.expiry_return_id,
        },
        transaction,
      });

      // Sum up all expiry values
      totalExpiryValue = expiryDetails.reduce(
        (sum, detail) => sum + (detail.expiry_value || 0),
        0
      );

      console.log(
        `Total expiry value for ${unloadingDate}: ${totalExpiryValue}`
      );
    }

    // Reduce gross profit by the total expiry value
    totalGrossProfit -= totalExpiryValue;

    console.log(
      `Final gross profit after deducting expiry value: ${totalGrossProfit}`
    );

    // Create or replace the daily sales record
    if (existingDailySales) {
      // Delete old sales details
      await db.DailySalesDetails.destroy({
        where: { sales_id: existingDailySales.sales_id },
        transaction,
      });

      // Update the existing daily sales record
      await existingDailySales.update(
        {
          units_sold: totalUnitsSold,
          sales_income: totalSalesIncome,
          gross_profit: totalGrossProfit,
        },
        { transaction }
      );

      console.log("Updated existing daily sales record");
    } else {
      // Create a new daily sales record
      existingDailySales = await db.DailySales.create(
        {
          sales_date: unloadingDate,
          lorry_id: lorryId,
          units_sold: totalUnitsSold,
          sales_income: totalSalesIncome,
          gross_profit: totalGrossProfit,
        },
        { transaction }
      );
      console.log("Created new daily sales record");
    }

    // Create detailed sales records for each product
    for (const item of salesItems) {
      await db.DailySalesDetails.create(
        {
          sales_id: existingDailySales.sales_id,
          product_id: item.product_id,
          units_sold: item.units_sold,
          sales_income: item.sales_income,
          gross_profit: item.gross_profit,
        },
        { transaction }
      );
    }

    console.log("Daily sales record created/updated successfully");
    return existingDailySales;
  } catch (error) {
    console.error("Error creating daily sales from unloading:", error);
    throw error;
  }
}

// Helper function to get value per bottle from product
async function getProductValuePerBottle(productId, transaction) {
  const product = await db.Product.findOne({
    where: { product_id: productId },
    transaction,
  });

  if (!product) {
    return 0;
  }

  // Use selling price or unit price as appropriate
  return product.unit_price || product.selling_price || 0;
}

exports.updateUnloadingTransaction = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, unloadingDetails } = req.body;

    // Get the current unloading transaction
    const unloadingTransaction = await UnloadingTransaction.findOne({
      where: { unloading_id: id },
      transaction: dbTransaction,
    });

    if (!unloadingTransaction) {
      throw new Error(`Unloading transaction with id ${id} not found`);
    }

    // Update the unloading transaction status
    await unloadingTransaction.update(
      { ...req.body },
      { transaction: dbTransaction }
    );

    // If the status is changing to "Cancelled", we need to remove returned items from inventory
    if (status === "Cancelled") {
      // Get all unloading details for this transaction
      const details = await UnloadingDetail.findAll({
        where: { unloading_id: id },
        transaction: dbTransaction,
      });

      // Adjust each product in inventory
      for (const detail of details) {
        const inventory = await StockInventory.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        const product = await db.Product.findOne({
          where: { product_id: detail.product_id },
          transaction: dbTransaction,
        });

        if (inventory) {
          const bottlesPerCase = product.bottles_per_case;
          const newCasesQty = inventory.cases_qty - detail.cases_returned;
          const newBottlesQty = inventory.bottles_qty - detail.bottles_returned;

          // Ensure we don't have negative inventory
          if (newCasesQty < 0 || newBottlesQty < 0) {
            throw new Error(
              `Cannot cancel unloading: Would result in negative inventory for product ${detail.product_id}`
            );
          }

          const newTotalBottles = newCasesQty * bottlesPerCase + newBottlesQty;

          // Calculate value per bottle
          const valuePerBottle = product.unit_price;

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

    // If new unloading details are provided, process them
    if (unloadingDetails && unloadingDetails.length > 0) {
      // Implementation for updating unloading details would go here
      // This would be similar to the create function but would handle
      // adding/removing products and adjusting inventory accordingly
    }

    await dbTransaction.commit();

    const updatedUnloadingTransaction = await UnloadingTransaction.findOne({
      where: { unloading_id: id },
      include: [{ model: db.UnloadingDetail }],
    });

    res.status(200).json(updatedUnloadingTransaction);
  } catch (error) {
    await dbTransaction.rollback();
    res.status(500).json({
      error: error.message,
      message: "Failed to update unloading transaction or inventory",
    });
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

// Function to handle inventory adjustments when recording sales from lorries
exports.recordSalesFromUnloading = async (req, res) => {
  const dbTransaction = await db.sequelize.transaction();

  try {
    const {
      unloading_id,
      lorry_id,
      sales_date,
      sales_items, // Array of {product_id, units_sold, sales_income, gross_profit}
    } = req.body;

    // Verify the unloading transaction exists
    const unloadingTransaction = await UnloadingTransaction.findOne({
      where: { unloading_id },
      transaction: dbTransaction,
    });

    if (!unloadingTransaction) {
      throw new Error(
        `Unloading transaction with ID ${unloading_id} not found`
      );
    }

    // Create sales record
    const newSales = await db.DailySales.create(
      {
        sales_date: sales_date || new Date(),
        lorry_id,
        units_sold: 0, // Will sum from sales_items
        sales_income: 0, // Will sum from sales_items
        gross_profit: 0, // Will sum from sales_items
      },
      { transaction: dbTransaction }
    );

    // Process each sales item
    let totalUnitsSold = 0;
    let totalSalesIncome = 0;
    let totalGrossProfit = 0;

    for (const item of sales_items) {
      // Create sales detail record
      await db.SalesDetail.create(
        {
          sales_id: newSales.sales_id,
          product_id: item.product_id,
          units_sold: item.units_sold,
          sales_income: item.sales_income,
          gross_profit: item.gross_profit,
        },
        { transaction: dbTransaction }
      );

      // Update totals
      totalUnitsSold += item.units_sold;
      totalSalesIncome += item.sales_income;
      totalGrossProfit += item.gross_profit;
    }

    // Update the sales record with totals
    await newSales.update(
      {
        units_sold: totalUnitsSold,
        sales_income: totalSalesIncome,
        gross_profit: totalGrossProfit,
      },
      { transaction: dbTransaction }
    );

    // Update the unloading transaction to reference this sale
    await unloadingTransaction.update(
      {
        status: "Completed",
        // Add any other fields needed
      },
      { transaction: dbTransaction }
    );

    await dbTransaction.commit();

    res.status(201).json({
      message: "Sales recorded successfully",
      sales: newSales,
    });
  } catch (error) {
    await dbTransaction.rollback();
    res.status(500).json({
      error: error.message,
      message: "Failed to record sales from unloading",
    });
  }
};

exports.getRecentUnloadingTransactions = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { lorryId, startDate, endDate, limit = 10 } = req.query;

    // Build the where clause based on filters
    const whereClause = {};

    // Add lorry filter if provided
    if (lorryId) {
      whereClause.lorry_id = lorryId;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause.unloading_date = {
        [db.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.unloading_date = {
        [db.Sequelize.Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.unloading_date = {
        [db.Sequelize.Op.lte]: new Date(endDate),
      };
    }

    // Fetch loading transactions with related data
    const unloadingTransactions = await UnloadingTransaction.findAll({
      where: whereClause,
      include: [
        {
          model: UnloadingDetail,
          as: "unloadingDetails",
          include: [
            {
              model: db.Product,
              as: "product",
              attributes: ["product_id", "product_name", "bottles_per_case"],
            },
          ],
        },
        {
          model: db.Lorry,
          as: "lorry",
          attributes: ["lorry_id", "lorry_number"],
        },
      ],
      order: [
        ["unloading_date", "DESC"],
        ["unloading_time", "DESC"],
      ],
      limit: parseInt(limit),
    });

    // Calculate summary information for each transaction
    const enhancedTransactions = unloadingTransactions.map((transaction) => {
      const plainTransaction = transaction.get({ plain: true });

      // Calculate totals if loadingDetails exist
      if (
        plainTransaction.unloadingDetails &&
        plainTransaction.unloadingDetails.length > 0
      ) {
        plainTransaction.totalCases = plainTransaction.unloadingDetails.reduce(
          (sum, detail) => sum + detail.cases_returned,
          0
        );

        plainTransaction.totalBottles =
          plainTransaction.unloadingDetails.reduce(
            (sum, detail) => sum + detail.bottles_returned,
            0
          );

        plainTransaction.totalValue = plainTransaction.unloadingDetails.reduce(
          (sum, detail) => sum + detail.value,
          0
        );
      } else {
        plainTransaction.totalCases = 0;
        plainTransaction.totalBottles = 0;
        plainTransaction.totalValue = 0;
      }

      return plainTransaction;
    });

    res.status(200).json(enhancedTransactions);
  } catch (error) {
    console.error("Error fetching loading transactions:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve recent loading transactions",
    });
  }
};
