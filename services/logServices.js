const LastIssueLog = require("../models/LastIssueLog");
const WinstonLog = require("../models/WinstonLog");

async function getAllIApplyDataWrong(){
    const lastIssueLogDate=new Date((await LastIssueLog.find({}))[0].timestamp)
    lastIssueLogDate.setHours(0,0,0,0)
    const allDataWrong= await WinstonLog
                                .find({
                                        message:"Incoming Incorect I-apply Data",
                                        timestamp:{$gte:lastIssueLogDate}
                                    })
    let result=[]
   allDataWrong.forEach((element)=>{
    result.push({_id:element._id, body:element._doc.meta.body, reasons:element._doc.meta.reasons,newBody:element._doc.meta.newBody})
    })
    return result
}

module.exports={getAllIApplyDataWrong}