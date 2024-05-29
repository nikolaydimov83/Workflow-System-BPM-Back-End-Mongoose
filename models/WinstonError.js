const mongoose = require('mongoose');

const winstonErrorSchema = new mongoose.Schema({
  // Define your schema fields here
  timestamp: Date,
  message: String,
  level: String,
  meta:Object,
  
});

// Specify the collection name here
const collectionName = 'winstonerrors';
const WinstonError = mongoose.model('WinstonError', winstonErrorSchema, collectionName);

module.exports = WinstonError;