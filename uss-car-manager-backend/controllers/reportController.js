const mongoose = require('mongoose');
const Car = require('../models/Car');
const Earning = require('../models/Earning');
const Expense = require('../models/Expense');
const Partner = require('../models/partnerModel');
const v = require('../utils/validation');
const { filters } = require('../utils/query');
const { expenseTotal } = require('../utils/legacy');
exports.summary = async (req, res) => {
  // Only these filters are supported; totals always cover all matching records.
  const filter = filters({ car: req.query.car, from: req.query.from, to: req.query.to }, 'Earning');
  const data = await mongoose.connection.transaction(async session => {
    const earnings = await Earning.find(filter).session(session).lean();
    const expenses = await Expense.find(filter).session(session).lean();
    const partners = await Partner.find(filter.car ? { car: filter.car } : {}).session(session).lean();
    const cars = await Car.find({}).select('_id').session(session).lean();
    return { earnings, expenses, partners, cars };
  });
  res.json(require('../utils/summary')(data));
};

exports.reminders = async (req, res) => {
  const days = v.integer(req.query.days ?? 30, 0, 365, 'Days');
  const cutoff = new Date(); cutoff.setUTCDate(cutoff.getUTCDate() + days); cutoff.setUTCHours(23, 59, 59, 999);
  const cars = await Car.find({ archived: { $ne: true } }).lean();
  const reminders = [];
  const today = new Date().toISOString().slice(0, 10);
  for (const car of cars) {
    for (const field of ['nextServiceDate', 'insuranceExpiry', 'pollutionExpiry']) {
      if (car[field] && new Date(car[field]) <= cutoff) reminders.push({ carId: car._id, carName: car.carName, carNumber: car.carNumber, type: field, dueDate: car[field], overdue: new Date(car[field]).toISOString().slice(0, 10) < today });
    }
    if (car.nextServiceKm != null && car.odometer != null && car.odometer >= car.nextServiceKm) reminders.push({ carId: car._id, carName: car.carName, carNumber: car.carNumber, type: 'nextServiceKm', dueKm: car.nextServiceKm, odometer: car.odometer, overdue: true });
  }
  res.json(reminders);
};
exports.exportCsv = async (req, res) => {
  const kind = v.enumeration(req.query.kind || 'expenses', ['expenses', 'earnings'], 'Kind');
  const expense = kind === 'expenses', Model = expense ? Expense : Earning;
  const filter = filters(req.query, expense ? 'Expense' : 'Earning');
  const records = await Model.find(filter).sort({ date: -1, _id: -1 }).populate('car', 'carName carNumber').lean();
  const rows = [['Date', 'Car', 'Registration', 'Type', 'Description', 'Amount INR', 'Notes']];
  for (const r of records) rows.push([r.date && Number.isFinite(new Date(r.date).getTime()) ? new Date(r.date).toISOString() : 'Unknown date', r.car?.carName || 'Missing car', r.car?.carNumber || '', expense ? (r.type || 'expense') : 'earning', expense ? r.category : r.source, expense ? expenseTotal(r) : r.amount, r.notes]);
  res.type('text/csv').attachment(`${kind}.csv`).send(require('../utils/csv')(rows));
};
