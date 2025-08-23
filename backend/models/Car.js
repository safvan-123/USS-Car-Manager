const mongoose = require("mongoose");

const carSchema = mongoose.Schema(
  {
    carName: { type: String, required: true },
    carNumber: { type: String, required: true },
    model: { type: String },
    owner: { type: String },
    image: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Car", carSchema);
