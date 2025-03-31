const db = require("../models");
const Shop = db.Shop;

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll();
    res.status(200).json(shops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findOne({
      where: { shop_id: id },
    });
    if (shop) {
      res.status(200).json(shop);
    } else {
      res.status(404).json({ message: `Shop with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createShop = async (req, res) => {
  try {
    const { shop_name, max_discounted_cases } = req.body;
    const newShop = await Shop.create({
      shop_name,
      max_discounted_cases,
    });
    res.status(201).json(newShop);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create shop",
    });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Shop.update(req.body, {
      where: { shop_id: id },
    });
    if (updated) {
      const updatedShop = await Shop.findOne({
        where: { shop_id: id },
      });
      return res.status(200).json(updatedShop);
    }
    throw new Error("Shop not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Shop.destroy({
      where: { shop_id: id },
    });
    if (deleted) {
      return res.status(204).send("Shop deleted");
    }
    throw new Error("Shop not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Set max discounted cases for a shop
exports.setShopMaxDiscountedCases = async (req, res) => {
  try {
    const { shop_id, max_discounted_cases } = req.body;

    const shop = await Shop.findOne({
      where: { shop_id },
    });

    if (!shop) {
      return res
        .status(404)
        .json({ message: `Shop with id ${shop_id} not found` });
    }

    const [updated] = await Shop.update(
      { max_discounted_cases },
      { where: { shop_id } }
    );

    if (updated) {
      const updatedShop = await Shop.findOne({
        where: { shop_id },
      });
      return res.status(200).json(updatedShop);
    }

    throw new Error("Failed to update shop maximum discounted cases");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
