const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { hashPassword } = require('../../utils/password');
const User = require('../../models/User');
const Partner = require('../../models/partnerModel');
const Expense = require('../../models/Expense');
const AuditLog = require('../../models/AuditLog');
require('../../models/Car');
const app = require('../../app');
test('API lifecycle against isolated MongoDB replica set', { timeout: 240000 }, async t => {
  const replica = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '7.0.24' } });
  let server;
  try {
    await mongoose.connect(replica.getUri());
    for (const model of Object.values(mongoose.models)) await model.createIndexes();
    await User.create({ name: 'Test admin', email: 'admin@test.local', role: 'admin', passwordHash: await hashPassword('Test-password-only-123') });
    await User.create({ name: 'Test viewer', email: 'viewer@test.local', role: 'viewer', passwordHash: await hashPassword('Test-password-only-123') });
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    let token;
    async function request(path, method = 'GET', body, auth = token) {
      const r = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
      return { status: r.status, data: await r.json(), headers: r.headers };
    }
    assert.equal((await request('/api/cars')).status, 401);
    assert.equal((await request('/api/auth/login', 'POST', { email: 'admin@test.local', password: 'wrong' })).status, 401);
    const login = await request('/api/auth/login', 'POST', { email: 'admin@test.local', password: 'Test-password-only-123' });
    assert.equal(login.status, 200); token = login.data.token;
    const car = await request('/api/cars', 'POST', { carName: 'Swift', carNumber: 'kl34 f 5202', year: 2019 });
    assert.equal(car.status, 201, JSON.stringify(car.data));
    const carId = car.data._id;
    assert.equal((await request('/api/cars', 'POST', { carName: 'Duplicate', carNumber: 'KL34F5202' })).status, 409);
    assert.equal((await request('/api/cars/bad-id')).status, 400);
    let p1, p2;
    await t.test('concurrent partner writes cannot overallocate ownership', async () => {
      const results = await Promise.all(['One', 'Two'].map(name => request('/api/partners', 'POST', { car: carId, name, sharePercentage: 60 })));
      assert.deepEqual(results.map(r => r.status).sort(), [201, 400]);
      p1 = results.find(r => r.status === 201).data;
      const result = await request('/api/partners', 'POST', { car: carId, name: 'Other', sharePercentage: 40, bankDetails: { accountNumber: 'TEST-ONLY' } });
      assert.equal(result.status, 201); p2 = result.data;
      assert.equal(p2.bankDetails, undefined);
    });
    let earning, expense;
    await t.test('server allocation, partial payment, notes and edit protections', async () => {
      const result = await request('/api/earnings', 'POST', { car: carId, date: '2026-10-05', source: 'Rent', amount: 100.01 });
      assert.equal(result.status, 201, JSON.stringify(result.data)); earning = result.data;
      assert.equal(earning.partners.reduce((n, p) => n + Math.round(p.amount * 100), 0), 10001);
      const updatedPartners = earning.partners.map(p => ({ partnerId: p.partnerId._id, amount: p.amount, paidAmount: p.partnerId._id === p1._id ? 10 : 0 }));
      const updated = await request(`/api/earnings/${earning._id}`, 'PUT', { partners: updatedPartners, __v: earning.__v });
      assert.equal(updated.status, 200, JSON.stringify(updated.data));
      assert.equal((await request(`/api/earnings/${earning._id}`, 'PUT', { notes: 'stale', __v: earning.__v })).status, 409);
      const notes = await request(`/api/earnings/${earning._id}`, 'PUT', { notes: 'Receipt checked' });
      assert.equal(notes.status, 200);
      assert.equal(notes.data.partners.find(p => p.partnerId._id === p1._id).paidAmount, 10);
      assert.equal((await request(`/api/earnings/${earning._id}`, 'PUT', { amount: 200 })).status, 409);
      assert.equal((await request(`/api/earnings/${earning._id}`, 'DELETE')).status, 409);
      const corrected = await request(`/api/earnings/${earning._id}/payment-correction`, 'POST', { partnerId: p1._id, paidAmount: 8, reason: 'Correcting a data entry mistake' });
      assert.equal(corrected.status, 200, JSON.stringify(corrected.data));
      assert.equal((await request(`/api/earnings/${earning._id}/payment-correction`, 'POST', { partnerId: p1._id, paidAmount: 10, reason: 'Restoring the verified payment amount' })).status, 200);
      const ex = await request('/api/expenses', 'POST', { car: carId, date: '2026-10-05', category: 'Fuel', totalAmount: 20 });
      assert.equal(ex.status, 201, JSON.stringify(ex.data)); expense = ex.data;
      assert.equal((await request('/api/expenses', 'POST', { car: carId, date: '2026-10-05', category: 'Fuel', totalAmount: 20, partners: [{ partnerId: p1._id, amount: 19 }] })).status, 400);
    });
    await t.test('cross-car allocations and orphan deletes are blocked', async () => {
      const other = await request('/api/cars', 'POST', { carName: 'Etios', carNumber: 'KL55T4456' });
      assert.equal((await request('/api/expenses', 'POST', { car: other.data._id, date: '2026-10-05', category: 'Fuel', totalAmount: 20, partners: [{ partnerId: p1._id, amount: 20 }] })).status, 400);
      assert.equal((await request(`/api/partners/${p1._id}`, 'DELETE')).status, 409);
    });
    await t.test('reports and role restrictions', async () => {
      const report = await request(`/api/reports/summary?car=${carId}`);
      assert.equal(report.status, 200, JSON.stringify(report.data));
      assert.equal(report.data.totals.earnings, 100.01);
      assert.equal(report.data.totals.expenses, 20);
      assert.equal(report.data.totals.recordedSurplus, 80.01);
      assert.equal(report.data.partners.find(p => p.partnerId === p1._id).earningsReceived, 10);
      const viewer = await request('/api/auth/login', 'POST', { email: 'viewer@test.local', password: 'Test-password-only-123' });
      assert.equal((await request('/api/cars', 'POST', { carName: 'Blocked', carNumber: 'KL10A1234' }, viewer.data.token)).status, 403);
      assert.equal((await request(`/api/partners/${p2._id}`, 'GET', undefined, viewer.data.token)).data.bankDetails, undefined);
      assert.equal((await request(`/api/partners/${p2._id}`)).data.bankDetails.accountNumber, 'TEST-ONLY');
      const list = await request('/api/cars?page=1&limit=1');
      assert.equal(list.data.length, 1); assert.equal(list.headers.get('x-total-count'), '2');
    });
    await t.test('archive retains history and restore works', async () => {
      assert.equal((await request(`/api/cars/${carId}`, 'DELETE')).status, 200);
      assert.equal((await request('/api/cars')).data.length, 1);
      assert.equal((await request('/api/cars?includeArchived=true')).data.length, 2);
      assert.ok(await Expense.findById(expense._id));
      assert.equal((await request(`/api/expenses/${expense._id}`, 'PUT', { notes: 'Blocked while archived' })).status, 409);
      assert.equal((await request(`/api/cars/${carId}/restore`, 'POST', {})).status, 200);
      assert.equal((await request(`/api/expenses/${expense._id}`, 'DELETE')).status, 200);
      assert.ok(await AuditLog.findOne({ entityId: expense._id, action: 'delete' }));
      assert.equal(await Partner.countDocuments({ car: carId }), 2);
      assert.equal((await request('/api/auth/logout', 'POST', {})).status, 200);
      assert.equal((await request('/api/cars')).status, 401);
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect(); await replica.stop();
  }
});
