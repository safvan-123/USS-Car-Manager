require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const app = require('./app');
const Car = require('./models/Car');
require('./models/partnerModel');
let server;
async function start() {
  await connectDB();
  if (await Car.exists({ registrationKey: { $exists: false } })) throw new Error('Existing cars need registration preparation. Read README and run npm run audit-data first.');
  // Build declared indexes without dropping unrelated indexes.
  for (const model of Object.values(mongoose.models)) await model.createIndexes();
  const port = Number(process.env.PORT || 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid PORT');
  server = app.listen(port, () => console.log(`Server running on port ${port}`));
  server.on('error', err => { console.error('HTTP startup failed:', err.code); process.exit(1); });
}
async function shutdown() {
  const timer = setTimeout(() => process.exit(1), 10000); timer.unref();
  if (server) await new Promise(resolve => server.close(resolve));
  await mongoose.disconnect(); process.exit(0);
}
process.on('SIGINT', shutdown); process.on('SIGTERM', shutdown);
start().catch(async err => {
  console.error('Startup failed:', err.message.replace(/mongodb(?:\+srv)?:\/\/\S+/g, '[redacted URI]'));
  await mongoose.disconnect(); process.exitCode = 1;
});
