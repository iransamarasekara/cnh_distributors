const db = require("../models");
const Discount = db.Discount;
const Shop = db.Shop;
const SubDiscountType = db.SubDiscountType;
const { Op } = require("sequelize");

exports.getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll({
      include: [
        {
          model: db.Shop,
          as: "shop",
        },
        {
          model: db.Lorry,
          as: "lorry",
        },
        {
          model: db.SubDiscountType,
          as: "subDiscountType",
        },
        // Product association has been removed from the diagram
      ],
    });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiscountById = async (req, res) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findOne({
      where: { discount_id: id },
      include: [
        {
          model: db.Shop,
          as: "shop",
        },
        {
          model: db.Lorry,
          as: "lorry",
        },
        {
          model: db.SubDiscountType,
          as: "subDiscountType",
        },
        // Product association has been removed from the diagram
      ],
    });
    if (discount) {
      res.status(200).json(discount);
    } else {
      res.status(404).json({ message: `Discount with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createDiscounts = async (req, res) => {
  try {
    const { shop_id, selling_date, lorry_id, invoice_number, discountItems } =
      req.body;

    // Validate required fields
    if (
      !shop_id ||
      !selling_date ||
      !lorry_id ||
      !invoice_number ||
      !discountItems ||
      !Array.isArray(discountItems)
    ) {
      return res.status(400).json({
        message: "Missing required fields or discountItems is not an array",
      });
    }

    // Find the shop to check max_discounted_cases
    const shop = await Shop.findOne({
      where: { shop_id },
    });

    if (!shop) {
      return res
        .status(404)
        .json({ message: `Shop with id ${shop_id} not found` });
    }

    // Calculate total discounted cases from all items
    const totalDiscountedCases = discountItems.reduce(
      (sum, item) => sum + item.discounted_cases,
      0
    );

    // Check if total discounted cases exceed max allowed
    if (totalDiscountedCases > shop.max_discounted_cases) {
      return res.status(400).json({
        message: `Total discounted cases (${totalDiscountedCases}) exceed maximum allowed (${shop.max_discounted_cases})`,
      });
    }

    // Check monthly limit (assuming this is part of your business logic)
    // Get current month's start and end dates
    const currentDate = new Date(selling_date);
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    // Get existing discounts for this shop in current month
    const existingDiscounts = await Discount.findAll({
      where: {
        shop_id,
        selling_date: {
          [db.Sequelize.Op.between]: [startOfMonth, endOfMonth],
        },
      },
    });

    const existingDiscountedCases = existingDiscounts.reduce(
      (sum, discount) => sum + discount.discounted_cases,
      0
    );

    if (
      existingDiscountedCases + totalDiscountedCases >
      shop.max_discounted_cases
    ) {
      return res.status(400).json({
        message: `Adding ${totalDiscountedCases} cases would exceed monthly limit. Already used: ${existingDiscountedCases}, Maximum: ${shop.max_discounted_cases}`,
      });
    }

    // Process each discount item
    const createdDiscounts = [];
    const errors = [];

    for (const item of discountItems) {
      const { sub_discount_type_id, discounted_cases } = item;

      try {
        // Find the discount value for this shop and sub-discount type
        const shopDiscountValue = await db.ShopDiscountValue.findOne({
          where: {
            shop_id,
            sub_discount_type_id,
          },
        });

        if (!shopDiscountValue) {
          errors.push(
            `Discount value for shop ${shop_id} and sub-discount type ${sub_discount_type_id} not found`
          );
          continue;
        }

        // Calculate total discount
        const total_discount =
          discounted_cases * shopDiscountValue.discount_value;

        // Create the discount record
        const newDiscount = await Discount.create({
          shop_id,
          selling_date,
          lorry_id,
          sub_discount_type_id,
          discounted_cases,
          invoice_number,
          total_discount,
        });

        createdDiscounts.push(newDiscount);
      } catch (error) {
        errors.push(
          `Error processing discount item ${sub_discount_type_id}: ${error.message}`
        );
      }
    }

    // Handle response based on results
    if (errors.length > 0 && createdDiscounts.length === 0) {
      // If all items failed, return an error
      return res.status(400).json({
        message: "Failed to create any discount items",
        errors,
      });
    } else if (errors.length > 0) {
      // If some items succeeded and some failed
      return res.status(207).json({
        message: "Some discount items were created with errors",
        created: createdDiscounts.length,
        total: discountItems.length,
        errors,
      });
    }

    // If all succeeded, return success
    return res.status(201).json({
      message: "All discount items created successfully",
      count: createdDiscounts.length,
      discounts: createdDiscounts,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create discounts",
    });
  }
};

exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      shop_id,
      selling_date,
      lorry_id,
      sub_discount_type_id,
      discounted_cases,
      // product_id removed as it's no longer in the diagram
      invoice_number,
    } = req.body;

    let updateData = { ...req.body };

    // If we're updating discount-related fields, recalculate total_discount
    if (
      discounted_cases !== undefined ||
      sub_discount_type_id !== undefined ||
      shop_id !== undefined
    ) {
      // Get current discount record
      const currentDiscount = await Discount.findOne({
        where: { discount_id: id },
      });

      if (!currentDiscount) {
        return res
          .status(404)
          .json({ message: `Discount with id ${id} not found` });
      }

      // Determine which shop_id and sub_discount_type_id to use
      const shopId = shop_id || currentDiscount.shop_id;
      const typeId =
        sub_discount_type_id || currentDiscount.sub_discount_type_id;

      // Find the discount value from shop_discount_values
      const shopDiscountValue = await db.ShopDiscountValues.findOne({
        where: {
          shop_id: shopId,
          sub_discount_type_id: typeId,
        },
      });

      if (!shopDiscountValue) {
        return res.status(404).json({
          message: `Discount value for shop ${shopId} and sub-discount type ${typeId} not found`,
        });
      }

      // Determine which discounted_cases to use
      const cases = discounted_cases || currentDiscount.discounted_cases;

      // If shop_id is being updated, check max_discounted_cases
      if (shop_id) {
        const shop = await Shop.findOne({
          where: { shop_id },
        });

        if (!shop) {
          return res
            .status(404)
            .json({ message: `Shop with id ${shop_id} not found` });
        }

        if (cases > shop.max_discounted_cases) {
          return res.status(400).json({
            message: `Discounted cases (${cases}) exceed maximum allowed (${shop.max_discounted_cases})`,
          });
        }
      }

      // Calculate new total discount using shop_discount_values
      updateData.total_discount = cases * shopDiscountValue.discount_value;
    }

    const [updated] = await Discount.update(updateData, {
      where: { discount_id: id },
    });

    if (updated) {
      const updatedDiscount = await Discount.findOne({
        where: { discount_id: id },
        include: [
          {
            model: db.Shop,
            as: "shop",
          },
          {
            model: db.Lorry,
            as: "lorry",
          },
          {
            model: db.SubDiscountType,
            as: "subDiscountType",
          },
          // Product association has been removed from the diagram
        ],
      });
      return res.status(200).json(updatedDiscount);
    }

    throw new Error("Discount not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Discount.destroy({
      where: { discount_id: id },
    });
    if (deleted) {
      return res.status(204).send("Discount deleted");
    }
    throw new Error("Discount not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getDiscountsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const discounts = await Discount.findAll({
      where: { shop_id: shopId },
      include: [
        {
          model: db.Shop,
          as: "shop",
        },
        {
          model: db.Lorry,
          as: "lorry",
        },
        {
          model: db.SubDiscountType,
          as: "subDiscountType",
        },
        // Product association has been removed from the diagram
      ],
    });
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDiscountsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const discounts = await Discount.findAll({
      where: {
        selling_date: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
      include: [
        {
          model: db.Shop,
          as: "shop",
        },
        {
          model: db.Lorry,
          as: "lorry",
        },
        {
          model: db.SubDiscountType,
          as: "subDiscountType",
        },
        // Product association has been removed from the diagram
      ],
    });

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discounts by shop and current month
exports.getDiscountsByShopAndCurrentMonth = async (req, res) => {
  try {
    const { shopId } = req.params;
    const currentMonth = await db.CocaColaMonth.findOne({
      where: {
        start_date: {
          [Op.lte]: new Date(),
        },
        end_date: {
          [Op.gte]: new Date(),
        },
      },
    });

    if (!currentMonth) {
      return res.status(404).json({ message: "No current month found" });
    }

    const discounts = await Discount.findAll({
      where: {
        shop_id: shopId,
        selling_date: {
          [Op.between]: [currentMonth.start_date, currentMonth.end_date],
        },
      },
      include: [
        {
          model: db.Shop,
          as: "shop",
        },
        {
          model: db.Lorry,
          as: "lorry",
        },
        {
          model: db.SubDiscountType,
          as: "subDiscountType",
        },
        // Product association has been removed from the diagram
      ],
    });

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
