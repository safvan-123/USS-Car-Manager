const express = require("express");
const router = express.Router();
const {
  addEarning,
  getEarnings,
  getEarningsByCar,
  getEarningById,
  updateEarning,
  deleteEarning,
} = require("../controllers/earningController");

router.post("/", addEarning); // Add earning
router.get("/", getEarnings); // Get all earnings
router.get("/car/:carId", getEarningsByCar); // Get earnings by carId
router.get("/:id", getEarningById); // Get single earning by ID
router.put("/:id", updateEarning); // Update earning
router.delete("/:id", deleteEarning); // Delete earning

module.exports = router;
