const winston=require('winston');
require('winston-mongodb');

const logger=winston.createLogger({
    transports:[

        new winston.transports.File({
            filename:'infosLog.log',
            level:'info'
        }),
        new winston.transports.MongoDB({
            level:'info',
            db:'mongodb://localhost:27217,localhost:27218,localhost:27219/eurobankApp2?replicaSet=myReplicaSet1',
            collection:'winstonlogs'
        })
    ],
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.metadata()
    
        
    )
})
module.exports=logger;