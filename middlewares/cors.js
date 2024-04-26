const debug = require('debug')('cors-debug');
module.exports =  {
    origin: ['http://localhost:3001','https://localhost:3000', 'http://localhost:3000'],
    optionsSuccessStatus: 200, 
    methods:['GET', 'PUT', 'POST','DELETE','HEAD','OPTIONS'],
    allowedHeaders:['Content-Type', 'X-Authorization']
  }

