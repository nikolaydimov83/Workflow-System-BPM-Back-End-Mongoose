const express=require('express');
const https = require('https');
const fs = require('fs');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
const verifyToken=require('./middlewares/jwt');
const routesConfig=require('./routes');
const corsOptions =require('./middlewares/cors');
const cron = require('node-cron');
const { replaceIapplyTable } = require('./importExternalFiles/csvImports');
const Role = require('./models/Role');
const { createRole } = require('./services/workflowServices');
const { createUser } = require('./services/adminServices');
const winstonExpress=require('express-winston');
const logger = require('./logger/logger');
const WinstonLog = require('./models/WinstonLog');
const { filePathKey, filePathCert, CONNECTION_STRING, PORT, IP_ADDRESS } = require('./constants');
const { getAllIApplyDataWrong } = require('./services/logServices');
const LastIssueLog = require('./models/LastIssueLog');
const { uploadUsersFromCSVFile } = require('./importExternalFiles/userActiveDirImports');


const credentials = {
  
  key: fs.readFileSync(filePathKey),
  cert: fs.readFileSync(filePathCert),
}

start();

async function start(){

    try {
        await  mongoose.connect(CONNECTION_STRING,{
            useUnifiedTopology:true,
            useNewUrlParser:true
        });
        console.log('Database connected')
    } catch (error) {
        console.error(error.message);
        process.exit(1)
    }
    cron.schedule('44 14 * * *', async () => {
        console.log('Running replaceIapplyTable() function...');
        try {
          await replaceIapplyTable();
        } catch (error) {
          console.log(error.message);
        }
      }, {
        scheduled: true,
        timezone: 'Europe/Sofia'
      });
      

    app.use(express.json());
    app.use((req, res, next) => {
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
      
      app.use(winstonExpress.logger({
        winstonInstance:logger,
        statusLevels:true
      }))
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
  });

    app.use(cors(corsOptions));
    app.use(verifyToken());
    
    routesConfig(app);
    
    const server = https.createServer(credentials, app);

    

    server.listen(PORT, () => console.log(`Server listens on port ${IP_ADDRESS+":"+PORT}!`));

    if (!(await Role.findOne({}))) {
      let adminRole = await createRole({ roleType: 'HO', roleName: 'Admin' });
      let adminUser = await createUser({ email: 'rkostyaneva@postbank.bg', branchNumber: 101, branchName: 'Admin', userStatus: 'Active', role: adminRole.id });
      let workflowRole = await createRole({ roleType: 'HO', roleName: 'Workflow' });
      let workflowUser = await createUser({ email: 'ihristozova@postbank.bg', branchNumber: 101, branchName: 'Workflow', userStatus: 'Active', role: workflowRole.id });
    } else {
        //await uploadUsersFromCSVFile()
        //let a=await getAllIApplyDataWrong()
        //console.log(a[0]._doc.meta.body)
        //await WinstonLog.deleteMany({})
        //let b=await LastIssueLog.find({})
        //console.log()
    }

}


