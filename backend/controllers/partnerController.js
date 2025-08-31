const Partner = require("../models/partnerModel");

// ➝ Create Partner
exports.createPartner = async (req, res) => {
  try {
    const partner = await Partner.create(req.body);
    res.status(201).json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ➝ Get Partners by Car
exports.getPartnersByCar = async (req, res) => {
  try {
    const partners = await Partner.find({ car: req.params.carId }).populate(
      "car"
    );
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPartners = async (req, res) => {
  try {
    const partners = await Partner.find().populate("car");
    res.status(200).json(partners);
  } catch (error) {
    res.status(500).json({ message: "Error fetching partners", error });
  }
};

// ➝ Get Single Partner
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).populate("car");
    if (!partner) return res.status(404).json({ message: "Partner not found" });
    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ➝ Update Partner
exports.updatePartner = async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(partner);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ➝ Delete Partner
exports.deletePartner = async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: "Partner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
