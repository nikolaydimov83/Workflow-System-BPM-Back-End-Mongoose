const IApply = require("../models/IApply");

async function readIapplyData(iApplyId){
    return await IApply.findOne({iApplyId});
}

module.exports={readIapplyData}