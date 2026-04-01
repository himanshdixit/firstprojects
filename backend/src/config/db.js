const mongoose = require('mongoose');
const appConfig = require('./app.config');

async function connectDB() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(appConfig.mongoUri, {
    dbName: appConfig.mongoDbName,
  });
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${appConfig.mongoDbName}`);
}

module.exports = connectDB;
