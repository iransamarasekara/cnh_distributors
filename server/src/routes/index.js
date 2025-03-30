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
const emptyReturns = require("./emptyReturnRoutes");
const expiryReturns = require("./expiryReturnRoutes");
const discountRoutes = require("./discountRoutes");
const cocaColaMonthRoutes = require("./cocaColaMonthRoutes");
const subDiscountTypeRoutes = require("./subDiscountTypeRoutes");
const shopRoutes = require("./shopRoutes");
const { verifyToken, authorize } = require("../middleware/authMiddleware");

const adminOnly = authorize("admin");

// Use the imported routes
router.use("/auth", authRoutes);
router.use("/lorries", lorryRoutes);
router.use("/products", productRoutes);
router.use("/loading-transactions", loadingTransactionRoutes);
router.use("/unloading-transactions", unloadingTransactionRoutes);
router.use("/loading-details", loadingDetailRoutes);
router.use("/unloading-details", unloadingDetailRoutes);
router.use("/daily-sales", verifyToken, adminOnly, dailySalesRoutes);
router.use("/stock-inventory", stockInventoryRoutes);
router.use("/empty-returns", emptyReturns);
router.use("/expiry-returns", expiryReturns);
router.use("/discounts", discountRoutes);
router.use("/coca-cola-month", cocaColaMonthRoutes);
router.use("/sub-discount-types", subDiscountTypeRoutes);
router.use("/shops", shopRoutes);

module.exports = router;
