const mongoose = require('mongoose');

const winstonLogMigrationsSchema = new mongoose.Schema({
  // Define your schema fields here
  timestamp: Date,
  message: String,
  level: String,
  meta:Object,
  input:{}, 
  output:{},
});

// Specify the collection name here
const collectionName = 'winstonLogMigrations';
const WinstonLogMigrations = mongoose.model('WinstonLogMigrations', winstonLogMigrationsSchema, collectionName);

module.exports = WinstonLogMigrations;