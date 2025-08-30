// const mongoose = require("mongoose");

// const expenseSchema = mongoose.Schema(
//   {
//     car: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Car", // Each expense belongs to a car
//       required: true,
//     },
//     date: { type: Date, required: true },
//     category: { type: String, required: true }, // Fuel, Service, Insurance, etc.
//     amount: { type: Number, required: true },
//     notes: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Expense", expenseSchema);
const mongoose = require("mongoose");

const expenseSchema = mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },

    // title: { type: String }, // e.g., "Fuel Bill"
    type: { type: String, enum: ["expense", "income"], default: "expense" },

    category: { type: String, required: true },
    totalAmount: { type: Number, required: true }, // instead of single `amount`
    date: { type: Date, required: true },
    notes: { type: String },

    partners: [
      {
        partnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },
        amount: { type: Number, required: true },
        paid: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
