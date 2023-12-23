//{statusName,statusDate,nextStatuses:[],statusSender:User}

const { Schema, model,Types } = require("mongoose");


const statusSchema=new Schema({
    statusName:{type:String, required:true,unique:true},
    nextStatuses:{type:[Types.ObjectId],ref:'Status'},
    statusCreateDate:{type:Date,default:Date.now,immutable:true},
    statusType:{type:Types.ObjectId, ref:'Role'}
});

statusSchema.index(
    {
    statusName:1
},{
    collation:{
        locale:'en',
        strength:2
    }
});


const Status=model('Status', statusSchema);

module.exports=Status;