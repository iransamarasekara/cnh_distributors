const express = require("express");
const router = express.Router();

// Import all route files
const authRoutes = require("./authRoutes");
const lorryRoutes = require("./lorryRoutes");
const productRoutes = require("./productRoutes");
const loadingTransactionRoutes = require("./loadingTransactionRoutes");
const unloadingTransactionRoutes = require("./unloadingTransactionRoutes");
const loadingDetailRoutes = require("./loadingDetailRoutes");
const unloadingDetailRoutes = require("./unloadingDetailRoutes");
const dailySalesRoutes = require("./dailySalesRoutes");
const stockInventoryRoutes = require("./stockInventoryRoutes");

// Use the imported routes
router.use("/auth", authRoutes);
router.use("/lorries", lorryRoutes);
router.use("/products", productRoutes);
router.use("/loading-transactions", loadingTransactionRoutes);
router.use("/unloading-transactions", unloadingTransactionRoutes);
router.use("/loading-details", loadingDetailRoutes);
router.use("/unloading-details", unloadingDetailRoutes);
router.use("/daily-sales", dailySalesRoutes);
router.use("/stock-inventory", stockInventoryRoutes);

module.exports = router;
