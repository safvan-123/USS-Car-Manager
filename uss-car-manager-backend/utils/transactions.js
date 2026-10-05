const mongoose = require('mongoose');
const Car = require('../models/Car');
const AuditLog = require('../models/AuditLog');
const { fail, id } = require('./validation');
const refId = value => id(typeof value === 'object' && value !== null ? String(value._id || value) : value);
async function lockCar(carId, session, allowArchived = false) {
  const car = await Car.findOneAndUpdate({ _id: carId }, { $inc: { mutationCounter: 1 } }, { new: true, session });
  if (!car) fail('Car not found', 404);
  if (car.archived && !allowArchived) fail('Restore this archived car before changing its records', 409);
  return car;
}
async function audit(req, session, action, entity, entityId, changes = {}) {
  // Store only caller-selected fields. Never store credentials or bank details.
  await AuditLog.create([{ actor: req.user._id, action, entity, entityId, changes }], { session });
}
const transaction = fn => mongoose.connection.transaction(fn);
function versionCheck(doc, body) {
  if (body.__v !== undefined && body.__v !== doc.__v) fail('This record changed. Refresh and try again.', 409);
}
module.exports = { lockCar, audit, transaction, versionCheck, refId };
