const { Op } = require("sequelize");
const db = require("../models");
const Product = db.Product;
const StockInventory = db.StockInventory;

exports.getAllProducts = async (req, res) => {
  try {
    // Extract filter parameters from query string
    const { size, brand, sortBy } = req.query;

    // Build query conditions
    const whereConditions = {};
    if (size) {
      whereConditions.size = size;
    }
    if (brand) {
      whereConditions.product_name = {
        [Op.like]: `%${brand}%`,
      };
    }

    // Build sort options
    let order = [];
    if (sortBy) {
      switch (sortBy) {
        case "Size":
          order.push(["size", "ASC"]);
          break;
        case "Brand":
          order.push(["product_name", "ASC"]);
          break;
        case "Count":
          order.push(["bottles_per_case", "ASC"]);
          break;
        default:
          order.push(["product_id", "ASC"]);
      }
    }

    const products = await Product.findAll({
      where: whereConditions,
      include: [
        {
          model: StockInventory,
          as: "inventory",
          required: false, // Use left join to include products with no inventory
        },
      ],
      order,
    });

    // Transform data for frontend
    const transformedProducts = products.map((product) => {
      const productJson = product.toJSON();
      const inventory = productJson.inventory || {};

      return {
        product_id: productJson.product_id,
        product_name: productJson.product_name,
        size: productJson.size,
        unit_price: productJson.unit_price,
        selling_price: productJson.selling_price,
        bottles_per_case: productJson.bottles_per_case,
        cases_qty: inventory.cases_qty || 0,
        bottles_qty: inventory.bottles_qty || 0,
        total_bottles: inventory.total_bottles || 0,
        total_value: inventory.total_value || 0,
        last_updated: inventory.last_updated,
      };
    });

    res.status(200).json(transformedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get unique sizes for filtering
exports.getProductSizes = async (req, res) => {
  try {
    const sizes = await Product.findAll({
      attributes: [
        [db.sequelize.fn("DISTINCT", db.sequelize.col("size")), "size"],
      ],
      order: [["size", "ASC"]],
    });

    res.status(200).json(sizes.map((item) => item.size));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unique brands for filtering
exports.getProductBrands = async (req, res) => {
  try {
    const brands = await Product.findAll({
      attributes: [
        [
          db.sequelize.fn("DISTINCT", db.sequelize.col("product_name")),
          "product_name",
        ],
      ],
      order: [["product_name", "ASC"]],
    });

    res.status(200).json(brands.map((item) => item.product_name));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      where: { product_id: id },
    });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: `Product with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      product_name,
      unit_price,
      selling_price,
      bottles_per_case,
      size,
      active,
    } = req.body;

    const newProduct = await Product.create({
      product_name,
      unit_price,
      selling_price,
      bottles_per_case,
      size,
      active: active !== undefined ? active : true,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Product.update(req.body, {
      where: { product_id: id },
    });
    if (updated) {
      const updatedProduct = await Product.findOne({
        where: { product_id: id },
      });
      return res.status(200).json(updatedProduct);
    }
    throw new Error("Product not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({
      where: { product_id: id },
    });
    if (deleted) {
      return res.status(204).send("Product deleted");
    }
    throw new Error("Product not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
