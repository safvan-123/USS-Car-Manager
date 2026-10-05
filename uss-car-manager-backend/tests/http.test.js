const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../app');
const { roles } = require('../middleware/auth');
test('HTTP guardrails run without a database', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    let r = await fetch(base + '/api/cars'); assert.equal(r.status, 401);
    r = await fetch(base + '/api/cars', { headers: { Authorization: 'Bearer invalid' } }); assert.equal(r.status, 401);
    r = await fetch(base + '/api/cars', { headers: { Origin: 'https://not-allowed.example' } }); assert.equal(r.status, 403);
    r = await fetch(base + '/api/cars', { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'Authorization' } });
    assert.equal(r.status, 204); assert.equal(r.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    r = await fetch(base + '/api/cars', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken' }); assert.equal(r.status, 400);
    r = await fetch(base + '/api/cars', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: 'x'.repeat(300000) }) }); assert.equal(r.status, 413);
    r = await fetch(base + '/health'); assert.equal(r.status, 503);
    r = await fetch(base + '/unknown'); assert.equal(r.status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
test('roles enforce staff boundaries', () => {
  assert.throws(() => roles('admin')({ user: { role: 'viewer' } }, {}, () => {}), /permission/);
  let allowed = false;
  roles('admin', 'manager')({ user: { role: 'manager' } }, {}, () => { allowed = true; });
  assert.equal(allowed, true);
});
test('password hashes verify and reject wrong passwords', async () => {
  const { hashPassword, verifyPassword } = require('../utils/password');
  const hash = await hashPassword('only-a-test-password');
  assert.equal(await verifyPassword('only-a-test-password', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
  assert.notEqual(hash, await hashPassword('only-a-test-password'));
});
