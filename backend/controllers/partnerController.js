// const Partner = require("../models/partnerModel");

// // ➝ Create Partner
// exports.createPartner = async (req, res) => {
//   try {
//     const partner = await Partner.create(req.body);
//     res.status(201).json(partner);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // ➝ Get Partners by Car
// exports.getPartnersByCar = async (req, res) => {
//   try {
//     const partners = await Partner.find({ car: req.params.carId }).populate(
//       "car"
//     );
//     res.json(partners);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getAllPartners = async (req, res) => {
//   try {
//     const partners = await Partner.find().populate("car");
//     res.status(200).json(partners);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching partners", error });
//   }
// };

// // ➝ Get Single Partner
// exports.getPartnerById = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.params.id).populate("car");
//     if (!partner) return res.status(404).json({ message: "Partner not found" });
//     res.json(partner);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ➝ Update Partner
// exports.updatePartner = async (req, res) => {
//   try {
//     const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     });
//     res.json(partner);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };

// // ➝ Delete Partner
// exports.deletePartner = async (req, res) => {
//   try {
//     await Partner.findByIdAndDelete(req.params.id);
//     res.json({ message: "Partner deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

const Expense = require("../models/Expense");
const Partner = require("../models/partnerModel");

// ➝ Add expense
const addExpense = async (req, res) => {
  try {
    const { car, totalAmount, ...rest } = req.body;

    // fetch partners of this car
    const partners = await Partner.find({ car });

    if (!partners || partners.length === 0) {
      return res
        .status(400)
        .json({ message: "No partners found for this car" });
    }

    // calculate each partner's share
    const partnerShares = partners.map((p) => ({
      partnerId: p._id,
      sharePercentage: p.sharePercentage,
      amount: (totalAmount * p.sharePercentage) / 100,
      paid: false,
    }));

    const expense = await Expense.create({
      car,
      totalAmount,
      ...rest,
      partners: partnerShares,
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➝ Update expense
const updateExpense = async (req, res) => {
  try {
    const { totalAmount, car, ...rest } = req.body;

    let partnerShares = [];

    if (totalAmount && car) {
      const partners = await Partner.find({ car });

      partnerShares = partners.map((p) => ({
        partnerId: p._id,
        sharePercentage: p.sharePercentage,
        amount: (totalAmount * p.sharePercentage) / 100,
        paid: false,
      }));
    }

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        totalAmount,
        ...rest,
        ...(partnerShares.length > 0 && { partners: partnerShares }),
      },
      { new: true }
    )
      .populate("car")
      .populate("partners.partnerId");

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➝ Get expenses by car
const getExpensesByCar = async (req, res) => {
  try {
    const expenses = await Expense.find({ car: req.params.carId })
      .populate("car")
      .populate("partners.partnerId");

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addExpense,
  updateExpense,
  getExpensesByCar,
};
