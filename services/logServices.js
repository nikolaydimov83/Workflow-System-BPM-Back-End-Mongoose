const LastIssueLog = require("../models/LastIssueLog");
const WinstonLogIapplyTransfer = require("../models/WinstonLogIApplyTransfers");

async function getAllIApplyDataWrong(page,pageSize){
    const lastIssueLogDate=new Date((await LastIssueLog.find({}))[0].timestamp)
    lastIssueLogDate.setHours(0,0,0,0)
    const query = {
        message: "Incoming Incorect I-apply Data",
        timestamp: { $gte: lastIssueLogDate }
    };
    const allDataWrong= await WinstonLogIapplyTransfer
                                .find(query)
                                .sort({timestamp:1})
                                .skip((page-1)*pageSize)
                                .limit(pageSize)
    const totalCount= await WinstonLogIapplyTransfer.countDocuments(query);
    let result=allDataWrong.map((element)=>({   _id:element._id, 
                                                body:element._doc.meta.body, 
                                                reasons:element._doc.meta.reasons,
                                                newBody:element._doc.meta.newBody
                                            }))
    return {result, totalCount}
}

module.exports={getAllIApplyDataWrong}