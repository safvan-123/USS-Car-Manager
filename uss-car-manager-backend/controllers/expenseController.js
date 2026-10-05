const c = require('./financialController')(require('../models/Expense'), 'Expense', 'totalAmount', 'category');
module.exports = { addExpense: c.create, getExpenses: c.getAll, getExpensesByCar: c.getByCar, getExpenseById: c.getOne, updateExpense: c.update, deleteExpense: c.remove, correctPayment: c.correctPayment };
