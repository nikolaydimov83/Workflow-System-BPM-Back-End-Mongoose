const express=require('express');
const https = require('https');
const fs = require('fs');
const app=express();
const cors=require('cors');
const mongoose=require('mongoose');
const verifyToken=require('./middlewares/jwt');
const routesConfig=require('./routes');
const corsOptions =require('./middlewares/cors');
const Role = require('./models/Role');
const { createRole } = require('./services/workflowServices');
const { createUser } = require('./services/adminServices');
const { filePathKey, filePathCert, CONNECTION_STRING, PORT, IP_ADDRESS } = require('./constants');
const logRequest=require('./middlewares/loggerMiddleware');
const { scheduleUploadIApplyData } = require('./scheduledTasks/shcheduleUploadIapplyData');
const Request = require('./models/Request');
const WinstonLog = require('./models/WinstonLog');
const WinstonLogIapplyTransfer = require('./models/WinstonLogIApplyTransfers');
const errorLogger = require('./logger/errorLogger');
const WinstonError = require('./models/WinstonError');
const { parseError } = require('./utils/utils');

const credentials = { 
  key: fs.readFileSync(filePathKey),
  cert: fs.readFileSync(filePathCert),
}
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  errorLogger.log('error',error.message)
  setTimeout(()=>{process.exit(1)},750)
});
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
    scheduleUploadIApplyData()
    app.use(express.json());
    app.use(logRequest());
    app.use(cors(corsOptions));
    app.use(verifyToken());

    routesConfig(app);
    app.use((err,req,res,next)=>{
      res.status(500);
      res.json({message:parseError(err)});
      console.error(err.message);
    });
    
    const server = https.createServer(credentials, app);
    server.listen(PORT, () => console.log(`Server listens on port ${IP_ADDRESS+":"+PORT}!`));

    if (!(await Role.findOne({}))) {
      let adminRole = await createRole({ roleType: 'HO', roleName: 'Admin' });
      let adminUser = await createUser({ email: 'rkostyaneva@postbank.bg', branchNumber: 101, branchName: 'Admin', userStatus: 'Active', role: adminRole.id });
      let workflowRole = await createRole({ roleType: 'HO', roleName: 'Workflow' });
      let workflowUser = await createUser({ email: 'ihristozova@postbank.bg', branchNumber: 101, branchName: 'Workflow', userStatus: 'Active', role: workflowRole.id });
    }else{
      //Request.deleteMany({}).then(()=>console.log('Requests deleted!'))
      //WinstonLog.deleteMany({})
      //WinstonLogIapplyTransfer.deleteMany({}).then(()=>console.log('Requests deleted!'));
      //await WinstonError.deleteMany({})
      //const a=await WinstonError.find({})
      //console.log(a)
    }
}




