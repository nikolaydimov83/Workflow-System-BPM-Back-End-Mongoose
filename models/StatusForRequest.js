const { Schema, model,Types } = require("mongoose");


const requestStatusSchema=new Schema({
    currentStatus:{type:Types.ObjectId,ref:'Status',required:true},
    statusIncomingDate:{type:Date,default:Date.now,immutable:true},
    statusSender:{type:Types.ObjectId,ref:'User'},
    requestId:{type:Types.ObjectId,ref:'Request'}
});

requestStatusSchema.index({requestId:1},{
    collation:{
        locale:'en',
        strength:2
    }
});


const StatusForRequest=model('StatusForRequest', requestStatusSchema);

module.exports=StatusForRequest;