const express = require("express");
const router = express.Router();
const {
  addCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

router.post("/", addCar); // Add new car
router.get("/", getCars); // Get all cars
router.get("/:id", getCarById); // Get one car
router.put("/:id", updateCar); // Update car
router.delete("/:id", deleteCar); // Delete car

module.exports = router;
