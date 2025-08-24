const mongoose = require("mongoose");

const earningSchema = mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car", // Each earning belongs to a car
      required: true,
    },
    date: { type: Date, required: true },
    source: { type: String, required: true }, // Trip, Rent, Bonus, etc.
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Earning", earningSchema);
