const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car", // Each expense belongs to a car
      required: true,
    },
    date: { type: Date, required: true },
    category: { type: String, required: true }, // Fuel, Service, Insurance, etc.
    amount: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
