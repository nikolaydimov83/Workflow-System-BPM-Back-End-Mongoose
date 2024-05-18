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
const winstonExpress=require('express-winston');
const logger = require('./logger/logger');
const { filePathKey, filePathCert, CONNECTION_STRING, PORT, IP_ADDRESS } = require('./constants');
const logRequest=require('./middlewares/loggerMiddleware');
const { scheduleUploadIApplyData } = require('./scheduledTasks/shcheduleUploadIapplyData');
const loggerIapply = require('./logger/iapplyLogger');
const Request = require('./models/Request');
const WinstonLog = require('./models/WinstonLog');


const credentials = { 
  key: fs.readFileSync(filePathKey),
  cert: fs.readFileSync(filePathCert),
}
/*process.on('uncaughtException', async (error) => {
    
  console.error('Uncaught Exception:', error);
  // Optionally perform cleanup tasks
  // For example: close database connections, release resources, etc.
  // Exit the process with a non-zero exit code to indicate an error
  await mongoose.disconnect()
  console.log('Database connection restarted!')
  await  mongoose.connect(CONNECTION_STRING,{
    useUnifiedTopology:true,
    useNewUrlParser:true
});

});*/
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
    app.use(winstonExpress.logger({
      winstonInstance:logger,
      statusLevels:true
    }));
    app.use(winstonExpress.logger({
      winstonInstance:loggerIapply,
      statusLevels:true
    }));
    app.use(logRequest());
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
    }else{
      Request.deleteMany({}).then(()=>console.log('Requests deleted!'))
      WinstonLog.deleteMany({})
    }
}




