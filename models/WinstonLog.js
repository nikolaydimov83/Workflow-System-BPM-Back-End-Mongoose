const mongoose = require('mongoose');

const winstonLogSchema = new mongoose.Schema({
  // Define your schema fields here
  timestamp: Date,
  message: String,
  level: String,
  meta:Object,
  
  method: String,
  url: String,
  ip: String,
  headers: Object,
  query: Object,
  body:{}, // Assuming request body will be stored as an object
  reasons:Object,
  responseStatus:Number,
  responseBody:String
  


});

// Specify the collection name here
const collectionName = 'winstonlogs';
const WinstonLog = mongoose.model('WinstonLog', winstonLogSchema, collectionName);

module.exports = WinstonLog;