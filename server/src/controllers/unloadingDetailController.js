const db = require("../models");
const UnloadingDetail = db.UnloadingDetail;

exports.getAllUnloadingDetails = async (req, res) => {
  try {
    const unloadingDetails = await UnloadingDetail.findAll();
    res.status(200).json(unloadingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnloadingDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const unloadingDetail = await UnloadingDetail.findOne({
      where: { unloading_detail_id: id },
    });
    if (unloadingDetail) {
      res.status(200).json(unloadingDetail);
    } else {
      res
        .status(404)
        .json({ message: `Unloading detail with id ${id} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUnloadingDetail = async (req, res) => {
  try {
    const {
      unloading_id,
      product_id,
      cases_returned,
      bottles_returned,
      total_bottles_returned,
      value,
    } = req.body;

    const newUnloadingDetail = await UnloadingDetail.create({
      unloading_id,
      product_id,
      cases_returned,
      bottles_returned,
      total_bottles_returned,
      value,
    });

    res.status(201).json(newUnloadingDetail);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to create unloading detail",
    });
  }
};

exports.updateUnloadingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await UnloadingDetail.update(req.body, {
      where: { unloading_detail_id: id },
    });
    if (updated) {
      const updatedUnloadingDetail = await UnloadingDetail.findOne({
        where: { unloading_detail_id: id },
      });
      return res.status(200).json(updatedUnloadingDetail);
    }
    throw new Error("Unloading detail not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteUnloadingDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await UnloadingDetail.destroy({
      where: { unloading_detail_id: id },
    });
    if (deleted) {
      return res.status(204).send("Unloading detail deleted");
    }
    throw new Error("Unloading detail not found");
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getUnloadingDetailsByUnloadingId = async (req, res) => {
  try {
    const { unloadingId } = req.params;
    const unloadingDetails = await UnloadingDetail.findAll({
      where: { unloading_id: unloadingId },
    });
    res.status(200).json(unloadingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUnloadingDetailsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;
    const unloadingDetails = await UnloadingDetail.findAll({
      where: { product_id: productId },
    });
    res.status(200).json(unloadingDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
