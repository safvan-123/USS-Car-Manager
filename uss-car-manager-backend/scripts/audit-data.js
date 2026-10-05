require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Car = require('../models/Car');
const Partner = require('../models/partnerModel');
const Earning = require('../models/Earning');
const Expense = require('../models/Expense');
const v = require('../utils/validation');
const shares = require('../utils/shares');
const { expenseTotal } = require('../utils/legacy');
(async () => {
  await connectDB();
  const cars = await Car.find().select('+registrationKey').lean();
  const partners = await Partner.find().lean();
  const carIds = new Set(cars.map(c => String(c._id)));
  const partnerMap = new Map(partners.map(p => [String(p._id), p]));
  const keys = new Map(), preparation = [], issues = [], notices = [];
  let fatalRegistration = false;
  const issue = (entity, record, message) => issues.push({ entity, id: String(record._id), message });
  for (const car of cars) {
    try {
      const key = v.numberPlate(car.carNumber);
      if (keys.has(key)) { fatalRegistration = true; issue('Car', car, `Duplicate registration with car ${keys.get(key)}`); }
      keys.set(key, String(car._id));
      if (car.registrationKey !== key) preparation.push({ updateOne: { filter: { _id: car._id }, update: { $set: { registrationKey: key } } } });
    } catch (err) { fatalRegistration = true; issue('Car', car, err.message); }
  }
  const shareTotals = new Map();
  for (const partner of partners) {
    if (!carIds.has(String(partner.car))) issue('Partner', partner, 'Referenced car is missing');
    try {
      const units = shares.weight(partner.sharePercentage);
      if (partner.status !== 'Inactive') shareTotals.set(String(partner.car), (shareTotals.get(String(partner.car)) || 0n) + units);
    } catch (err) { issue('Partner', partner, err.message); }
  }
  for (const [car, total] of shareTotals) if (!shares.complete(total)) issues.push({ entity: 'Car', id: car, message: `Active shares total ${Number(total) / Number(shares.SCALE)}%; automatic splits require 100% within tiny precision tolerance` });
  for (const [Model, field] of [[Earning, 'amount'], [Expense, 'totalAmount']]) {
    for await (const record of Model.find().lean().cursor()) {
      if (!carIds.has(String(record.car))) issue(Model.modelName, record, 'Referenced car is missing');
      if (record.type === 'income') issue('Expense', record, 'Legacy income: check it is not also recorded in Earnings');
      try {
        if (Model === Expense && record.totalAmount == null && record.amount != null) notices.push({ entity: 'Expense', id: String(record._id), message: 'Legacy amount field is supported; no migration required' });
        const total = v.cents(Model === Expense ? expenseTotal(record) : record[field], 'Total', false);
        let sum = 0; const used = new Set();
        for (const row of record.partners || []) {
          const pid = String(row.partnerId), partner = partnerMap.get(pid);
          if (!partner || String(partner.car) !== String(record.car)) issue(Model.modelName, record, 'Missing partner or partner from another car');
          if (used.has(pid)) issue(Model.modelName, record, 'Duplicate partner allocation');
          used.add(pid);
          const allocated = v.cents(row.amount, 'Partner amount'); sum += allocated;
          if (row.paidAmount != null && v.cents(row.paidAmount, 'Paid amount') > allocated) issue(Model.modelName, record, 'Paid amount exceeds allocation');
        }
        if (sum !== total) issue(Model.modelName, record, `Allocation difference: ${(total - sum) / 100} rupees`);
      } catch (err) { issue(Model.modelName, record, err.message); }
    }
  }
  console.log(JSON.stringify({ cars: cars.length, partners: partners.length, registrationKeysToPrepare: preparation.length, notices, issues }, null, 2));
  if (process.argv.includes('--prepare-registration-keys')) {
    if (fatalRegistration) throw new Error('Resolve duplicate/invalid registration numbers before preparation');
    // Run while the old server is STOPPED, on a backed-up database.
    if (preparation.length) await mongoose.connection.transaction(session => Car.collection.bulkWrite(preparation, { session }));
    await Car.createIndexes();
    console.log('Registration keys prepared. Financial records were not modified.');
  }
  if (issues.length) process.exitCode = 2;
})().catch(err => { console.error('Audit failed:', err.name, err.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[redacted URI]')); process.exitCode = 1; }).finally(() => mongoose.disconnect());
