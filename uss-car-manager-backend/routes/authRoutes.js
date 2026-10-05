const express = require('express');
const { randomBytes } = require('node:crypto');
const User = require('../models/User');
const Session = require('../models/Session');
const { hashPassword, verifyPassword, tokenHash } = require('../utils/password');
const { requireAuth } = require('../middleware/auth');
const v = require('../utils/validation');
const router = express.Router();
// Per-process limiter; use a shared edge/Redis limiter for multiple instances.
const attempts = new Map();
const dummyHash = hashPassword(randomBytes(32).toString('hex'));
router.post('/login', async (req, res) => {
  v.object(req.body);
  const email = v.text(req.body.email, 'Email', 254, true).toLowerCase();
  if (typeof req.body.password !== 'string' || req.body.password.length > 256) v.fail('Invalid credentials', 401);
  const now = Date.now();
  for (const [key, entry] of attempts) if (entry.reset < now) attempts.delete(key);
  const key = req.ip;
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (entry.count >= 20 || attempts.size > 10000) v.fail('Too many login attempts. Try again later.', 429);
  entry.count++; attempts.set(key, entry);
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = await verifyPassword(req.body.password, user?.passwordHash || await dummyHash);
  if (!valid || !user?.active) v.fail('Invalid credentials', 401);
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(now + 8 * 60 * 60 * 1000);
  await Session.create({ tokenHash: tokenHash(token), user: user._id, expiresAt });
  res.json({ token, expiresAt, user: { _id: user._id, name: user.name, role: user.role, email: user.email } });
});
router.get('/me', requireAuth, (req, res) => res.json({ _id: req.user._id, name: req.user.name, role: req.user.role, email: req.user.email }));
router.post('/logout', requireAuth, async (req, res) => {
  await Session.deleteOne({ _id: req.authSession._id }); res.json({ message: 'Logged out' });
});
module.exports = router;
