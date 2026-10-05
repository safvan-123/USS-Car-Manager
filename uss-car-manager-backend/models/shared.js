const mongoose = require('mongoose');
const { cents } = require('../utils/validation');
const money = { type: Number, min: 0, validate: { validator: v => { try { cents(v); return true; } catch { return false; } }, message: 'Use a non-negative amount with at most two decimal places' } };
const shareSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  sharePercentage: { type: Number, min: 0, max: 100 },
  amount: { ...money, required: true },
  // No default: old records use their legacy paid boolean until explicitly updated.
  paidAmount: { ...money },
  paid: { type: Boolean, default: false }
});
const options = { timestamps: true, optimisticConcurrency: true };
module.exports = { money, shareSchema, options };
