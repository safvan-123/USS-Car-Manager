const mongoose = require('mongoose');
module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('Set MONGO_URI in .env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, autoIndex: false });
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if (!hello.setName && hello.msg !== 'isdbgrid') throw new Error('This backend requires MongoDB Atlas or a replica set for financial transactions');
  console.log('MongoDB connected');
  return mongoose.connection;
};
