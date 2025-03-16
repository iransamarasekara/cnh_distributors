const express = require("express");
const router = express.Router();
const stockInventoryController = require("../controllers/stockInventoryController");

// Get all stock inventory records
router.get("/", stockInventoryController.getAllStockInventory);

// Get a specific stock inventory record by ID
router.get("/:id", stockInventoryController.getStockInventoryById);

// Create a new stock inventory record
router.post("/", stockInventoryController.createStockInventory);

// Update a stock inventory record
router.put("/:id", stockInventoryController.updateStockInventory);

// Delete a stock inventory record
router.delete("/:id", stockInventoryController.deleteStockInventory);

// Get stock inventory by product ID
router.get(
  "/product/:productId",
  stockInventoryController.getStockInventoryByProductId
);

// Update stock quantity (for inventory adjustments)
router.patch("/:id/quantity", stockInventoryController.updateStockQuantity);

router.get("/history/:productId", stockInventoryController.getInventoryHistory);

module.exports = router;
