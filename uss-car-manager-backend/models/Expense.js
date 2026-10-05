const mongoose = require('mongoose');
const { money, shareSchema, options } = require('./shared');
const { financialJson } = require('../utils/legacy');
const schema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  category: { type: String, required: true, trim: true, maxlength: 120 },
  totalAmount: { ...money, required: function () { return this.amount == null; } },
  // Read legacy records without moving/changing their stored amount.
  amount: { ...money },
  date: { type: Date, required: true },
  notes: { type: String, maxlength: 2000 },
  partners: [shareSchema]
}, options);
schema.index({ car: 1, date: -1 });
schema.set('toJSON', { transform: (doc, result) => financialJson(doc, result, true) });
module.exports = mongoose.model('Expense', schema);
