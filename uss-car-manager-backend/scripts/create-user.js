require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { hashPassword } = require('../utils/password');
const v = require('../utils/validation');
(async () => {
  const name = v.text(process.env.CREATE_USER_NAME, 'Name', 100, true);
  const email = v.text(process.env.CREATE_USER_EMAIL, 'Email', 254, true).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) v.fail('Invalid email');
  const password = process.env.CREATE_USER_PASSWORD;
  if (!password || password.length < 12 || password.length > 256) v.fail('Set CREATE_USER_PASSWORD to a unique password of 12–256 characters');
  const role = v.enumeration(process.env.CREATE_USER_ROLE || 'admin', ['admin', 'manager', 'viewer'], 'Role');
  await connectDB(); await User.createIndexes();
  await User.create({ name, email, role, passwordHash: await hashPassword(password) });
  console.log('User created. Remove CREATE_USER_PASSWORD from .env now.');
})().catch(err => { console.error(err.code === 11000 ? 'This user already exists; no password was changed.' : 'User creation failed: ' + err.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
