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
        {
          model: db.Product,
          as: "product",
        },
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
        {
          model: db.Product,
          as: "product",
        },
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

exports.createDiscount = async (req, res) => {
  try {
    const {
      shop_id,
      selling_date,
      lorry_id,
      sub_discount_type_id,
      discounted_cases,
      product_id,
      invoice_number,
    } = req.body;

    // Find the shop to check max_discounted_cases
    const shop = await Shop.findOne({
      where: { shop_id },
    });

    if (!shop) {
      return res
        .status(404)
        .json({ message: `Shop with id ${shop_id} not found` });
    }

    // Find the discount type to get discount amount
    const subDiscountType = await SubDiscountType.findOne({
      where: { sub_discount_type_id },
    });

    if (!subDiscountType) {
      return res.status(404).json({
        message: `SubDiscountType with id ${sub_discount_type_id} not found`,
      });
    }

    // Check if discounted cases exceed max allowed
    if (discounted_cases > shop.max_discounted_cases) {
      return res.status(400).json({
        message: `Discounted cases (${discounted_cases}) exceed maximum allowed (${shop.max_discounted_cases})`,
      });
    }

    // Calculate total discount
    const total_discount = discounted_cases * subDiscountType.discount_amount;

    const newDiscount = await Discount.create({
      shop_id,
      selling_date,
      lorry_id,
      sub_discount_type_id,
      discounted_cases,
      product_id,
      invoice_number,
      total_discount,
    });

    // Fetch the complete discount object with associations
    const completeDiscount = await Discount.findOne({
      where: { discount_id: newDiscount.discount_id },
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
        {
          model: db.Product,
          as: "product",
        },
      ],
    });

    res.status(201).json(completeDiscount);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create discount",
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
      product_id,
      invoice_number,
    } = req.body;

    let updateData = { ...req.body };

    // If we're updating discount-related fields, recalculate total_discount
    if (discounted_cases !== undefined || sub_discount_type_id !== undefined) {
      // Get current discount record
      const currentDiscount = await Discount.findOne({
        where: { discount_id: id },
      });

      if (!currentDiscount) {
        return res
          .status(404)
          .json({ message: `Discount with id ${id} not found` });
      }

      // Determine which sub_discount_type_id to use
      const typeId =
        sub_discount_type_id || currentDiscount.sub_discount_type_id;

      // Find the discount type to get discount amount
      const subDiscountType = await SubDiscountType.findOne({
        where: { sub_discount_type_id: typeId },
      });

      if (!subDiscountType) {
        return res.status(404).json({
          message: `SubDiscountType with id ${typeId} not found`,
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

      // Calculate new total discount
      updateData.total_discount = cases * subDiscountType.discount_amount;
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
          {
            model: db.Product,
            as: "product",
          },
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
        {
          model: db.Product,
          as: "product",
        },
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
        {
          model: db.Product,
          as: "product",
        },
      ],
    });

    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
