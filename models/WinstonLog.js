const mongoose = require('mongoose');

const winstonLogSchema = new mongoose.Schema({
  // Define your schema fields here
  timestamp: Date,
  message: String,
  level: String,
  meta:Object,
  
  method: {
    type: String,
  },
  url: {
    type: String,
  },
  ip: {
    type: String,
  },
  headers: {
    type: Object, // Assuming headers will be stored as an object
  },
  query: {
    type: Object, // Assuming query parameters will be stored as an object
  },
  body:Object, // Assuming request body will be stored as an object
  
  

  // ... other fields
});

// Specify the collection name here
const collectionName = 'winstonlogs';
const WinstonLog = mongoose.model('WinstonLog', winstonLogSchema, collectionName);

module.exports = WinstonLog;