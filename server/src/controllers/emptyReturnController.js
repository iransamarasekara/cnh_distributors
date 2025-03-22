// controllers/emptyReturnsController.js
const {
  EmptyReturn,
  EmptyReturnsDetail,
  Lorry,
  Product,
} = require("../models");
const { Op } = require("sequelize");

// Get empty returns for a specific time period with optional lorry filter
exports.getEmptyReturnsByTimeFrame = async (req, res) => {
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

    // Fetch empty returns with details
    const emptyReturns = await EmptyReturn.findAll({
      where: whereConditions,
      include: [
        {
          model: Lorry,
          as: "lorry",
          attributes: ["lorry_id", "lorry_number"],
        },
        {
          model: EmptyReturnsDetail,
          as: "emptyReturnsDetails",
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
    const totalEmptyBottles = emptyReturns.reduce((sum, emptyReturn) => {
      return (
        sum +
        emptyReturn.emptyReturnsDetails.reduce((detailSum, detail) => {
          return detailSum + detail.empty_bottles_returned;
        }, 0)
      );
    }, 0);

    const totalEmptyCases = emptyReturns.reduce((sum, emptyReturn) => {
      return (
        sum +
        emptyReturn.emptyReturnsDetails.reduce((detailSum, detail) => {
          return detailSum + detail.empty_cases_returned;
        }, 0)
      );
    }, 0);

    // Return formatted response
    res.status(200).json({
      success: true,
      count: emptyReturns.length,
      summary: {
        totalEmptyBottles,
        totalEmptyCases,
      },
      data: emptyReturns,
    });
  } catch (error) {
    console.error("Error fetching empty returns:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching empty returns",
      error: error.message,
    });
  }
};

// Get details for a specific empty return
exports.getEmptyReturnById = async (req, res) => {
  try {
    const { id } = req.params;

    const emptyReturn = await EmptyReturn.findByPk(id, {
      include: [
        {
          model: Lorry,
          as: "lorry",
          attributes: ["lorry_id", "lorry_number"],
        },
        {
          model: EmptyReturnsDetail,
          as: "emptyReturnsDetails",
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

    if (!emptyReturn) {
      return res.status(404).json({
        success: false,
        message: `Empty return with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: emptyReturn,
    });
  } catch (error) {
    console.error("Error fetching empty return details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching empty return details",
      error: error.message,
    });
  }
};
