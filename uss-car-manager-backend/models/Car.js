const mongoose = require('mongoose');
const { options } = require('./shared');
const schema = new mongoose.Schema({
  carName: { type: String, required: true, trim: true, maxlength: 100 },
  carNumber: { type: String, required: true, trim: true, maxlength: 30 },
  registrationKey: { type: String, select: false },
  model: { type: String, maxlength: 80 },
  year: { type: Number, min: 1900, max: 2100 },
  owner: { type: String, maxlength: 300 },
  image: { type: String, maxlength: 2048 },
  status: { type: String, enum: ['Available', 'Rented', 'Under Maintenance'], default: 'Available' },
  odometer: { type: Number, min: 0 },
  nextServiceKm: { type: Number, min: 0 },
  nextServiceDate: Date,
  insuranceExpiry: Date,
  pollutionExpiry: Date,
  notes: { type: String, maxlength: 2000 },
  archived: { type: Boolean, default: false },
  mutationCounter: { type: Number, default: 0, select: false }
}, options);
schema.index({ registrationKey: 1 }, { unique: true, partialFilterExpression: { registrationKey: { $type: 'string' } } });
module.exports = mongoose.model('Car', schema);
