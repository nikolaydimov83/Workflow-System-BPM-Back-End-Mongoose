const logger=require('../logger/logger')

module.exports=()=>(req, res, next) => {
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const clientIp = forwardedFor || realIp || req.socket.remoteAddress;
    const sensitiveFields = ['password','re-password','x-authorization'];
    const filteredBody = { ...req.body };
    const filteredHeaders={...req.headers}

    sensitiveFields.forEach(field => {
      if (filteredBody[field]) {
        delete filteredBody[field];
      }
      if (filteredHeaders[field]){
        delete filteredHeaders[field]
      }
    });
    
    let responseBody = '';
    const originalWrite = res.write;
    res.write = function (chunk, encoding, callback) {      
      responseBody += chunk.toString();
      originalWrite.apply(res, arguments);
    };
  
    const originalEnd = res.end;
    res.end = function (chunk, encoding, callback) {
      if (chunk) {      
        responseBody += chunk.toString();
      }
  
      originalEnd.apply(res, arguments);
    }  
    const originalJson = res.json;
    res.json=function(json){
        
        let stringifiedJSON=JSON.stringify(json);
      
      responseBody += stringifiedJSON
      originalJson.call(res, json);
    }    
    res.on('finish',()=>{
      responseBody = responseBody.replace(/"accessToken":"[^"]+"/g, '"accessToken":"***"');
      logger.info({
        message: 'Incoming Request',
        method: req.method,
        url: req.url,
        ip: clientIp,
        headers: filteredHeaders,
        query: req.query,
        body: filteredBody,
        responseStatus:res.statusCode,
        responseBody:responseBody
      });
    })


  next(); 
}