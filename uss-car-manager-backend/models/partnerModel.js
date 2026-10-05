const mongoose = require('mongoose');
const { options } = require('./shared');
const schema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  contactDetails: { phone: { type: String, maxlength: 30 }, email: { type: String, maxlength: 254 }, address: { type: String, maxlength: 500 } },
  bankDetails: { type: new mongoose.Schema({ accountNumber: String, ifsc: String, upiId: String }, { _id: false }), select: false },
  sharePercentage: { type: Number, required: true, min: 0, max: 100, validate: { validator: value => Number.isFinite(value) && value > 0, message: 'Share percentage must be greater than zero' } },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, options);
module.exports = mongoose.model('Partner', schema);
