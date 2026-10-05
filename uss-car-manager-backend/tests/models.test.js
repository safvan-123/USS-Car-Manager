const { test } = require('node:test');
const assert = require('node:assert/strict');
const Car = require('../models/Car');
const Earning = require('../models/Earning');
const Expense = require('../models/Expense');
test('schema validation rejects missing car fields', () => {
  assert.ok(new Car({}).validateSync());
});
test('schema rejects invalid currency and keeps legacy paidAmount unset', () => {
  const row = { car: '123456789012345678901234', date: new Date(), source: 'Rent', amount: 10, partners: [{ partnerId: '123456789012345678901234', amount: 10, paid: true }] };
  const doc = new Earning(row);
  assert.equal(doc.validateSync(), undefined);
  assert.equal(doc.partners[0].paidAmount, undefined);
  doc.amount = -1; assert.ok(doc.validateSync());
  doc.amount = 1.234; assert.ok(doc.validateSync());
});
test('expense allocations retain historical share percentages', () => {
  const doc = new Expense({ car: '123456789012345678901234', date: new Date(), category: 'Fuel', totalAmount: 10, partners: [{ partnerId: '123456789012345678901234', sharePercentage: 100, amount: 10 }] });
  assert.equal(doc.validateSync(), undefined);
  assert.equal(doc.partners[0].sharePercentage, 100);
});
