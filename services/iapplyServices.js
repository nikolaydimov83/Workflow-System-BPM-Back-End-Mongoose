const IApply = require("../models/IApply");

async function readIapplyData(iApplyId){
    return await IApply.findOne({iApplyId});
}

async function changeIapplyDataByIApplyId(iApplyId,newEntry){
    return await IApply.findOneAndUpdate({iApplyId},newEntry,{ new: true });
}



module.exports={readIapplyData,changeIapplyDataByIApplyId}