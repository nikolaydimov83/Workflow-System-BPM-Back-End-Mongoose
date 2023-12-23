const { Schema, model } = require("mongoose")

const tokenSchema=new Schema({
    token:{type:String,unique:true}
});

tokenSchema.index({token:1},{
    collation:{
        locale:'en',
        strength:2
    }
});





const InvalidToken=model('InvalidToken', tokenSchema);

module.exports=InvalidToken;