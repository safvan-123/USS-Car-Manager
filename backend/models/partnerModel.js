const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    name: { type: String, required: true },
    contactDetails: {
      phone: { type: String },
      email: { type: String },
      address: { type: String },
    },
    bankDetails: {
      accountNumber: { type: String },
      ifsc: { type: String },
      upiId: { type: String },
    },
    sharePercentage: { type: Number, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", partnerSchema);
