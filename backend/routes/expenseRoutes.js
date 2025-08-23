const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenses,
  getExpensesByCar,
  updateExpense,
  deleteExpense,
  getExpenseById,
} = require("../controllers/expenseController");

router.post("/", addExpense); // Add expense
router.get("/", getExpenses); // Get all expenses
router.get("/car/:carId", getExpensesByCar); // Get expenses by carId
router.get("/:id", getExpenseById); // 👈 Get single expense by ID
router.put("/:id", updateExpense); // Update expense
router.delete("/:id", deleteExpense); // Delete expense

module.exports = router;
