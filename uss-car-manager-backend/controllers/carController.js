const Car = require('../models/Car');
const v = require('../utils/validation');
const { transaction, lockCar, audit, versionCheck } = require('../utils/transactions');
const { filters, list } = require('../utils/query');
function input(body, create = false) {
  v.object(body);
  const out = {};
  for (const [key, max] of [['carName', 100], ['model', 80], ['owner', 300], ['notes', 2000]]) {
    if (body[key] !== undefined || (create && key === 'carName')) out[key] = v.text(body[key], key, max, key === 'carName');
  }
  if (body.carNumber !== undefined || create) {
    out.carNumber = v.numberPlate(body.carNumber);
    out.registrationKey = out.carNumber;
  }
  if (body.image !== undefined) {
    out.image = v.text(body.image, 'Image URL', 2048);
    if (out.image && !/^https?:\/\//i.test(out.image) && !/^\/[^/]/.test(out.image)) v.fail('Image must be an HTTP(S) URL or a relative /path');
  }
  if (body.status !== undefined) out.status = v.enumeration(body.status, ['Available', 'Rented', 'Under Maintenance'], 'Status');
  for (const key of ['odometer', 'nextServiceKm']) if (body[key] !== undefined) out[key] = v.integer(body[key], 0, 10000000, key);
  if (body.year !== undefined) out.year = v.integer(body.year, 1900, new Date().getFullYear() + 1, 'Year');
  for (const key of ['insuranceExpiry', 'pollutionExpiry', 'nextServiceDate']) if (body[key] !== undefined) out[key] = body[key] === null || body[key] === '' ? null : v.date(body[key], key);
  return out;
}
async function addCar(req, res) {
  const fields = input(req.body, true);
  const result = await transaction(async session => {
    const [car] = await Car.create([fields], { session });
    await audit(req, session, 'create', 'Car', car._id, { carNumber: car.carNumber });
    return car;
  });
  res.status(201).json(result);
}
const getCars = (req, res) => list(Car, filters(req.query, 'Car'), req, res);
async function getCarById(req, res) {
  const car = await Car.findById(v.id(req.params.id));
  if (!car) v.fail('Car not found', 404);
  res.json(car);
}
async function updateCar(req, res) {
  const fields = input(req.body);
  const result = await transaction(async session => {
    const car = await lockCar(v.id(req.params.id), session, true);
    versionCheck(car, req.body);
    Object.assign(car, fields);
    await car.save({ session });
    await audit(req, session, 'update', 'Car', car._id, { fields: Object.keys(fields) });
    return car;
  });
  res.json(result);
}
async function setArchived(req, res, archived) {
  const result = await transaction(async session => {
    const car = await lockCar(v.id(req.params.id), session, true);
    car.archived = archived;
    await car.save({ session });
    await audit(req, session, archived ? 'archive' : 'restore', 'Car', car._id);
    return car;
  });
  res.json({ message: archived ? 'Car archived; financial history retained' : 'Car restored', car: result });
}
module.exports = { addCar, getCars, getCarById, updateCar, deleteCar: (req, res) => setArchived(req, res, true), restoreCar: (req, res) => setArchived(req, res, false) };
