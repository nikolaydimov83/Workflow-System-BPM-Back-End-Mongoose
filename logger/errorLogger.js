const winston=require('winston');
require('winston-mongodb');

const errorLogger=winston.createLogger({
    transports:[
        
        new winston.transports.File({
            filename:'errorsLog.log',
            level:'error'
        }),
        new winston.transports.MongoDB({
            level:'error',
            db:'mongodb://localhost:27217,localhost:27218,localhost:27219/eurobankApp2?replicaSet=myReplicaSet1',
            collection:'winstonerrors'
        })
    ],
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.metadata()
    
        
    )
})
module.exports=errorLogger;