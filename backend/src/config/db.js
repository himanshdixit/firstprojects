const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/Codex_test_db';
  await mongoose.connect(uri, {
    dbName: 'Codex_test_db',
  });
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}

module.exports = connectDB;
