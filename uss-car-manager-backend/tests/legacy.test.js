const { test } = require('node:test');
const assert = require('node:assert/strict');
const { splitAmount } = require('../utils/money');
const shares = require('../utils/shares');
const { expenseTotal, financialJson } = require('../utils/legacy');
const summary = require('../utils/summary');
const Expense = require('../models/Expense');
const Earning = require('../models/Earning');
const Partner = require('../models/partnerModel');
const carId = '123456789012345678901234';
const pids = ['223456789012345678901234', '323456789012345678901234', '423456789012345678901234'];
const thirds = [33.33333333333, 33.3333333333, 33.3333333333];
test('existing one-third ownership is accepted without rewriting percentages', () => {
  const partners = thirds.map((sharePercentage, i) => ({ _id: pids[i], sharePercentage }));
  const before = JSON.stringify(partners);
  const rows = splitAmount(22800, partners);
  assert.equal(rows.reduce((n, r) => n + Math.round(r.amount * 100), 0), 2280000);
  assert.deepEqual(rows.map(r => r.amount), [7600, 7600, 7600]);
  assert.deepEqual(rows.map(r => r.sharePercentage), thirds);
  assert.equal(JSON.stringify(partners), before);
  assert.equal(new Partner({ car: carId, name: 'Test', sharePercentage: thirds[0] }).validateSync(), undefined);
});
test('share tolerance accepts tiny precision error but not 99.99 percent', () => {
  assert.equal(shares.complete(shares.sumWeights(thirds)), true);
  assert.equal(shares.complete(shares.sumWeights([33.33, 33.33, 33.33])), false);
  for (const value of [NaN, Infinity, null, {}, 0, -1, 101]) assert.throws(() => shares.weight(value));
  assert.throws(() => splitAmount(100, pids.map(_id => ({ _id, sharePercentage: 33.33 }))));
});
test('tiny and large currency allocations still total exactly with thirds', () => {
  const partners = thirds.map((sharePercentage, i) => ({ _id: pids[i], sharePercentage }));
  for (const total of [0.01, 0.02, 1, 15200, 66853, 999999999.99]) {
    const rows = splitAmount(total, partners);
    assert.equal(rows.reduce((n, r) => n + Math.round(r.amount * 100), 0), Math.round(total * 100));
  }
});
test('legacy expense reads expose a total without changing the stored fields', () => {
  const doc = Expense.hydrate({ _id: pids[0], car: carId, date: new Date(), category: 'Rent', amount: 12000 });
  assert.equal(doc.totalAmount, undefined);
  assert.equal(doc.toJSON().totalAmount, 12000);
  assert.equal(doc.toJSON().usesLegacyAmount, true);
  assert.equal(doc.toJSON().allocationStatus, 'unallocated');
  assert.equal(doc.totalAmount, undefined);
  assert.deepEqual(doc.modifiedPaths(), []);
  assert.equal(doc.validateSync(), undefined);
  assert.equal(expenseTotal({ amount: 12, totalAmount: 0 }), 0);
  assert.equal(expenseTotal({ amount: 12, totalAmount: 10 }), 10);
});
test('existing paid earnings retain their amounts and show the 7199 difference', () => {
  const doc = Earning.hydrate({ _id: pids[0], car: carId, date: new Date(), source: 'Rent', amount: 15200, partners: pids.map(partnerId => ({ partnerId, amount: 2667, paid: true })) });
  const output = doc.toJSON();
  assert.equal(output.allocationDifference, 7199);
  assert.equal(output.allocationStatus, 'needs-review');
  assert.ok(output.partners.every(p => p.amount === 2667 && p.paid === true && p.paidAmount === undefined));
  assert.deepEqual(doc.modifiedPaths(), []);
});
test('missing populated car keeps its original reference in API JSON', () => {
  const doc = { populated: key => key === 'car' ? carId : undefined };
  const output = financialJson(doc, { car: null, amount: 2220, partners: [] });
  assert.equal(output.carId, carId); assert.equal(output.missingCar, true);
});
test('reports handle legacy totals, retained orphans and paid mismatches without mutation', () => {
  const data = {
    cars: [{ _id: carId }], partners: pids.map(_id => ({ _id, name: 'Test partner' })),
    earnings: [
      { _id: 'e1', car: carId, amount: 15200, partners: pids.map(partnerId => ({ partnerId, amount: 2667, paid: true })) },
      { _id: 'e2', car: 'missing', amount: 2220 }
    ],
    expenses: [
      { _id: 'x1', car: carId, amount: 12000 },
      { _id: 'x2', car: carId, totalAmount: 22800, amount: 22800, partners: pids.map(partnerId => ({ partnerId, amount: 7599, paid: true })) },
      { _id: 'x3', car: 'missing', amount: 3600 }
    ]
  };
  const before = JSON.stringify(data), result = summary(data);
  assert.equal(result.totals.earnings, 17420);
  assert.equal(result.totals.expenses, 38400);
  assert.equal(result.orphanedTotals.earnings, 2220);
  assert.equal(result.orphanedTotals.expenses, 3600);
  assert.equal(result.orphanedRecords.length, 2);
  assert.equal(result.legacyAmountRecords, 2);
  assert.equal(result.allocationDifferences.find(r => r.id === 'x2').difference, 3);
  assert.equal(result.allocationDifferences.find(r => r.id === 'e1').difference, 7199);
  assert.equal(result.partners[0].earningsReceived, 2667);
  assert.equal(JSON.stringify(data), before);
});
test('offsetting allocation errors remain visible even if the overall gap is zero', () => {
  const result = summary({ cars: [{ _id: carId }], partners: [], expenses: [], earnings: [
    { _id: 'a', car: carId, amount: 10, partners: [{ partnerId: pids[0], amount: 9 }] },
    { _id: 'b', car: carId, amount: 10, partners: [{ partnerId: pids[0], amount: 11 }] }
  ] });
  assert.equal(result.totals.unallocatedEarnings, 0);
  assert.equal(result.allocationDifferences.length, 2);
  assert.ok(result.warnings.some(w => w.includes('allocations')));
});
test('editing an existing allocation mismatch preserves money and paid flags', async t => {
  const mongoose = require('mongoose');
  const Car = require('../models/Car');
  const AuditLog = require('../models/AuditLog');
  const controller = require('../controllers/financialController')(Earning, 'Earning', 'amount', 'source');
  const doc = Earning.hydrate({ _id: pids[0], car: carId, date: new Date(), source: 'Rent', amount: 15200, partners: pids.map(partnerId => ({ partnerId, amount: 2667, paid: true })) });
  t.mock.method(mongoose.connection, 'transaction', async fn => fn({}));
  t.mock.method(Car, 'findOneAndUpdate', async () => ({ _id: carId, archived: false }));
  t.mock.method(Earning, 'findById', () => ({ session: async () => doc, populate: async () => doc }));
  t.mock.method(Partner, 'find', () => ({ session: async () => pids.map((_id, i) => ({ _id, car: carId, status: 'Active', sharePercentage: thirds[i] })) }));
  t.mock.method(AuditLog, 'create', async () => []);
  t.mock.method(doc, 'save', async () => { await doc.validate(); return doc; });
  let output;
  await controller.update({ params: { id: pids[0] }, user: { _id: pids[1] }, body: { notes: 'Reviewed without recalculating', partners: pids.map(partnerId => ({ partnerId, amount: 2667, paid: true })) } }, { json: value => { output = value; } });
  assert.equal(output.amount, 15200);
  assert.ok(output.partners.every(p => p.amount === 2667 && p.paid && p.paidAmount === 2667));
  assert.equal(output.toJSON().allocationDifference, 7199);
  await assert.rejects(controller.update({ params: { id: pids[0] }, user: { _id: pids[1] }, body: { amount: 16000 } }, { json() {} }), /recorded partner payments/);
});
