// const mongoose = require("mongoose");

// const earningSchema = mongoose.Schema(
//   {
//     car: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Car", // Each earning belongs to a car
//       required: true,
//     },
//     date: { type: Date, required: true },
//     source: { type: String, required: true }, // Trip, Rent, Bonus, etc.
//     amount: { type: Number, required: true },
//     notes: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Earning", earningSchema);

const mongoose = require("mongoose");

const earningSchema = mongoose.Schema(
  {
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    date: { type: Date, required: true },
    source: { type: String, required: true }, // Trip, Rent, Bonus, etc.
    amount: { type: Number, required: true },
    notes: { type: String },

    // 🔹 Partner-wise earnings
    partners: [
      {
        partnerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Partner",
        },
        amount: { type: Number, default: 0 },
        paid: { type: Boolean, default: false }, // track whether earning share is paid
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Earning", earningSchema);
