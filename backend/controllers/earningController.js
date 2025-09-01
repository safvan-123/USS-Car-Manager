const Earning = require("../models/Earning");

// Add earning
const addEarning = async (req, res) => {
  try {
    const earning = await Earning.create(req.body);
    res.status(201).json(earning);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all earnings
const getEarnings = async (req, res) => {
  try {
    const earnings = await Earning.find()
      .populate("car")
      .populate("partners.partnerId");
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get earnings for a specific car
const getEarningsByCar = async (req, res) => {
  try {
    const earnings = await Earning.find({ car: req.params.carId })
      .populate("car")
      .populate("partners.partnerId", "name");
    res.json(earnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single earning
const getEarningById = async (req, res) => {
  try {
    const earning = await Earning.findById(req.params.id)
      .populate("car")
      .populate("partners.partnerId", "name");
    if (!earning) return res.status(404).json({ message: "Earning not found" });
    res.json(earning);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update earning
const updateEarning = async (req, res) => {
  try {
    const earning = await Earning.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("car")
      .populate("partners.partnerId", "name");
    if (!earning) return res.status(404).json({ error: "Earning not found" });
    res.json(earning);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete earning
const deleteEarning = async (req, res) => {
  try {
    const earning = await Earning.findByIdAndDelete(req.params.id);
    if (!earning) return res.status(404).json({ error: "Earning not found" });
    res.json({ message: "Earning deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addEarning,
  getEarnings,
  getEarningsByCar,
  getEarningById,
  updateEarning,
  deleteEarning,
};
