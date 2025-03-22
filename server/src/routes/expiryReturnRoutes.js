const express = require("express");
const router = express.Router();
const expiryReturnController = require("../controllers/expiryReturnController");

// Get all lorries
router.get("/", expiryReturnController.getExpiryReturnsByTimeFrame);

module.exports = router;
