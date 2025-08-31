const Expense = require("../models/Expense");
const Partner = require("../models/partnerModel");

// ➝ Add expense
// const addExpense = async (req, res) => {
//   try {
//     const { car, totalAmount, ...rest } = req.body;

//     // fetch partners of this car
//     const partners = await Partner.find({ car });

//     if (!partners || partners.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No partners found for this car" });
//     }

//     // calculate each partner's share
//     const partnerShares = partners.map((p) => ({
//       partnerId: p._id,
//       sharePercentage: p.sharePercentage,
//       amount: (totalAmount * p.sharePercentage) / 100,
//       paid: false,
//     }));

//     const expense = await Expense.create({
//       car,
//       totalAmount,
//       ...rest,
//       partners: partnerShares,
//     });

//     res.status(201).json(expense);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
const addExpense = async (req, res) => {
  try {
    const { car, totalAmount, partners: frontendPartners, ...rest } = req.body;

    let partnerShares = [];

    if (frontendPartners && frontendPartners.length > 0) {
      // Use frontend values (amount + paid)
      partnerShares = frontendPartners.map((p) => ({
        partnerId: p.partnerId,
        sharePercentage: p.sharePercentage,
        amount: p.amount,
        paid: p.paid ?? false, // keep frontend paid status or default false
      }));
    } else {
      // fallback: calculate from backend percentages
      const partners = await Partner.find({ car });
      if (!partners || partners.length === 0) {
        return res
          .status(400)
          .json({ message: "No partners found for this car" });
      }
      partnerShares = partners.map((p) => ({
        partnerId: p._id,
        sharePercentage: p.sharePercentage,
        amount: (totalAmount * p.sharePercentage) / 100,
        paid: false,
      }));
    }

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

// ➝ Get all expenses (with car & partners)
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("car")
      .populate("partners.partnerId");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➝ Get expenses for a specific car
const getExpensesByCar = async (req, res) => {
  try {
    const expenses = await Expense.find({ car: req.params.carId })
      .populate("car")
      .populate("partners.partnerId", "name");
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ➝ Get single expense by ID
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("car")
      .populate("partners.partnerId");
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ➝ Update expense

// const updateExpense = async (req, res) => {
//   try {
//     const { totalAmount, car, ...rest } = req.body;

//     // Fetch the existing expense
//     const existingExpense = await Expense.findById(req.params.id);
//     if (!existingExpense) {
//       return res.status(404).json({ error: "Expense not found" });
//     }

//     let partnerShares = existingExpense.partners; // keep old if not recalculated

//     // Determine values (fallback to existing if not provided)
//     const newTotal =
//       totalAmount !== undefined ? totalAmount : existingExpense.totalAmount;
//     const newCar = car || existingExpense.car;

//     // Recalculate partner shares if either totalAmount or car is changed
//     if (totalAmount !== undefined || car) {
//       const partners = await Partner.find({ car: newCar });

//       partnerShares = partners.map((p) => ({
//         partnerId: p._id,
//         sharePercentage: p.sharePercentage,
//         amount: (newTotal * p.sharePercentage) / 100,
//         paid: false,
//       }));
//     }

//     // Update
//     const updatedExpense = await Expense.findByIdAndUpdate(
//       req.params.id,
//       {
//         totalAmount: newTotal,
//         car: newCar,
//         ...rest,
//         partners: partnerShares,
//       },
//       { new: true }
//     )
//       .populate("car")
//       .populate("partners.partnerId");

//     res.json(updatedExpense);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

const updateExpense = async (req, res) => {
  try {
    const { totalAmount, car, partners: incomingPartners, ...rest } = req.body;

    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    let partnerShares = existingExpense.partners; // default keep old
    const newTotal =
      totalAmount !== undefined ? totalAmount : existingExpense.totalAmount;
    const newCar = car || existingExpense.car;

    if (incomingPartners && incomingPartners.length > 0) {
      // ✅ Use frontend’s updated partners (manual edits)
      partnerShares = incomingPartners;
    } else if (totalAmount !== undefined || car) {
      // ✅ Otherwise recalc shares
      const partners = await Partner.find({ car: newCar });
      partnerShares = partners.map((p) => ({
        partnerId: p._id,
        sharePercentage: p.sharePercentage,
        amount: (newTotal * p.sharePercentage) / 100,
        paid: false,
      }));
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        totalAmount: newTotal,
        car: newCar,
        ...rest,
        partners: partnerShares,
      },
      { new: true }
    )
      .populate("car")
      .populate("partners.partnerId");

    res.json(updatedExpense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ➝ Delete expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpensesByCar,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
