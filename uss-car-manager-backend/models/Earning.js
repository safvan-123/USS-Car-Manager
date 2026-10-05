const mongoose = require('mongoose');
const { money, shareSchema, options } = require('./shared');
const { financialJson } = require('../utils/legacy');
const schema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  date: { type: Date, required: true },
  source: { type: String, required: true, trim: true, maxlength: 120 },
  amount: { ...money, required: true },
  notes: { type: String, maxlength: 2000 },
  partners: [shareSchema]
}, options);
schema.index({ car: 1, date: -1 });
schema.set('toJSON', { transform: (doc, result) => financialJson(doc, result) });
module.exports = mongoose.model('Earning', schema);
