// controllers/expiryReturnsController.js
const {
  ExpiryReturn,
  ExpiryReturnsDetail,
  Lorry,
  Product,
} = require("../models");
const { Op } = require("sequelize");

// Get expiry returns for a specific time period with optional lorry filter
exports.getExpiryReturnsByTimeFrame = async (req, res) => {
  try {
    // Extract query parameters with validation
    const { startDate, endDate, lorryId } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Both startDate and endDate are required query parameters",
      });
    }

    // Build query conditions
    const whereConditions = {
      return_date: {
        [Op.between]: [startDate, endDate],
      },
    };

    // Add lorry filter if provided
    if (lorryId) {
      whereConditions.lorry_id = lorryId;
    }

    // Fetch expiry returns with details
    const expiryReturns = await ExpiryReturn.findAll({
      where: whereConditions,
      include: [
        {
          model: Lorry,
          as: "lorry",
          attributes: ["lorry_id", "lorry_number"],
        },
        {
          model: ExpiryReturnsDetail,
          as: "expiryReturnsDetails",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "product_name", "size"],
            },
          ],
        },
      ],
      order: [["return_date", "DESC"]],
    });

    // Calculate summary statistics
    const totalExpiredBottles = expiryReturns.reduce((sum, expiryReturn) => {
      return (
        sum +
        expiryReturn.expiryReturnsDetails.reduce((detailSum, detail) => {
          return detailSum + detail.bottles_expired;
        }, 0)
      );
    }, 0);

    const totalExpiryValue = expiryReturns.reduce((sum, expiryReturn) => {
      return (
        sum +
        expiryReturn.expiryReturnsDetails.reduce((detailSum, detail) => {
          return detailSum + detail.expiry_value;
        }, 0)
      );
    }, 0);

    // Return formatted response
    res.status(200).json({
      success: true,
      count: expiryReturns.length,
      summary: {
        totalExpiredBottles,
        totalExpiryValue: parseFloat(totalExpiryValue.toFixed(2)),
      },
      data: expiryReturns,
    });
  } catch (error) {
    console.error("Error fetching expiry returns:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expiry returns",
      error: error.message,
    });
  }
};

// Get details for a specific expiry return
exports.getExpiryReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const expiryReturn = await ExpiryReturn.findByPk(id, {
      include: [
        {
          model: Lorry,
          as: "lorry",
          attributes: ["lorry_id", "lorry_number"],
        },
        {
          model: ExpiryReturnsDetail,
          as: "expiryReturnsDetails",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["product_id", "product_name", "size"],
            },
          ],
        },
      ],
    });

    if (!expiryReturn) {
      return res.status(404).json({
        success: false,
        message: `Expiry return with ID ${id} not found`,
      });
    }

    // Calculate totals for this specific return
    const totalExpiredBottles = expiryReturn.expiryReturnsDetails.reduce(
      (sum, detail) => sum + detail.bottles_expired,
      0
    );

    const totalExpiryValue = expiryReturn.expiryReturnsDetails.reduce(
      (sum, detail) => sum + detail.expiry_value,
      0
    );

    res.status(200).json({
      success: true,
      summary: {
        totalExpiredBottles,
        totalExpiryValue: parseFloat(totalExpiryValue.toFixed(2)),
      },
      data: expiryReturn,
    });
  } catch (error) {
    console.error("Error fetching expiry return details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching expiry return details",
      error: error.message,
    });
  }
};
