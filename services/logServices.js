const WinstonLog = require("../models/WinstonLog");

async function getAllIApplyDataWrong(){
    return WinstonLog.find({message:"Incoming Incorect I-apply Data"})
}

module.exports={getAllIApplyDataWrong}