const { test } = require('node:test');
const assert = require('node:assert/strict');
const v = require('../utils/validation');
const { splitAmount, paidCents, normalisePayment } = require('../utils/money');
test('currency rejects negative, non-finite, excessive precision and operator inputs', () => {
  for (const input of [-1, NaN, Infinity, '', null, true, {}, '1.001', '1e4']) assert.throws(() => v.cents(input));
  assert.equal(v.cents('123.45'), 12345);
});
test('allocation totals remain exact for awkward amounts', () => {
  const partners = [{ _id: 'a', sharePercentage: 33.33 }, { _id: 'b', sharePercentage: 33.33 }, { _id: 'c', sharePercentage: 33.34 }];
  for (const amount of ['0.01', '1', '4400', '66853', '999999999.99']) {
    const result = splitAmount(amount, partners);
    assert.equal(result.reduce((sum, r) => sum + v.cents(r.amount), 0), v.cents(amount));
  }
});
test('equal remainder is deterministic', () => {
  assert.deepEqual(splitAmount('0.01', [{ _id: 'b', sharePercentage: 50 }, { _id: 'a', sharePercentage: 50 }]).map(p => p.amount), [0, 0.01]);
});
test('incomplete percentages are rejected', () => {
  assert.throws(() => splitAmount(100, [{ _id: 'a', sharePercentage: 90 }]));
});
test('legacy paid flags and partial payments are preserved', () => {
  assert.equal(paidCents({ amount: 50, paid: true }), 5000);
  const row = normalisePayment({ amount: 100 }, { amount: 100, paidAmount: 25, paid: false });
  assert.equal(row.paidAmount, 25); assert.equal(row.paid, false);
  assert.throws(() => normalisePayment({ amount: 100, paidAmount: 20 }, row));
  assert.throws(() => normalisePayment({ amount: 100, paidAmount: 101 }));
  assert.equal(normalisePayment({ amount: 100, paid: true }, row).paidAmount, 100);
  assert.equal(normalisePayment({ amount: 100, paidAmount: 5 }, row, true).paidAmount, 5);
});
test('registration, IDs and dates are validated', () => {
  assert.equal(v.numberPlate('kl34 f-5202'), 'KL34F5202');
  assert.throws(() => v.id('bad-id'));
  assert.throws(() => v.date('2026-02-30'));
  assert.equal(v.escapeRegex('a.*(b)'), 'a\\.\\*\\(b\\)');
});
test('CSV output escapes quotes and spreadsheet formula inputs', () => {
  const csv = require('../utils/csv');
  assert.equal(csv([['=1+1', 'a"b', 'normal']]), '\uFEFF"\'=1+1","a""b","normal"');
});
