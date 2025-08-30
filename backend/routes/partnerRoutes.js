const express = require("express");
const {
  createPartner,
  getPartnersByCar,
  getPartnerById,
  updatePartner,
  deletePartner,
  getAllPartners,
} = require("../controllers/partnerController");

const router = express.Router();

router.post("/", createPartner);
router.get("/", getAllPartners);
router.get("/car/:carId", getPartnersByCar);
router.get("/:id", getPartnerById);
router.put("/:id", updatePartner);
router.delete("/:id", deletePartner);

module.exports = router;
