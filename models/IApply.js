const { Schema, model } = require("mongoose")

const iApplyShema=new Schema({ iApplyId: String, clientName: String, 
                                clientEGFN: String,product:String,
                                amount:Number,ccy:String,
                                finCenter:Number,refferingFinCenter:Number})

const IApply=model('IApply', iApplyShema, 'iApplyData'); 

module.exports=IApply