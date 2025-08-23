const Expense = require("../models/Expense");

// Add expense
const addExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all expenses (with car details)
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate("car"); // show car details
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get expenses for a specific car
const getExpensesByCar = async (req, res) => {
  try {
    const expenses = await Expense.find({ car: req.params.carId }).populate(
      "car"
    );
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("car");
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Update expense
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete expense
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
