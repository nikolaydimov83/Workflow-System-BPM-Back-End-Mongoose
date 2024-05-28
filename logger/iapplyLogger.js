const winston=require('winston');
require('winston-mongodb');

const loggerIapply=winston.createLogger({
    transports:[
        /*new winston.transports.File({
            filename:'infosLogIapply.log',
            level:'info'
        }), */       
        new winston.transports.MongoDB({
            level:'info',
            db:'mongodb://localhost:27217,localhost:27218,localhost:27219/eurobankApp2?replicaSet=myReplicaSet1',
            collection:'winstonLogIapplyTransfers'
        })
    ],
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.metadata()
    
        
    )
})
module.exports=loggerIapply;