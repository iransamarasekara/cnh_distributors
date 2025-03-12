const db = require("../models");
const Product = db.Product;

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
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
