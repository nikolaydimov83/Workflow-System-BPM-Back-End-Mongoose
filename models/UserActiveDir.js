const { Schema, model, Types } = require("mongoose");
const Role = require("./Role");

const userActiveDirSchema=new Schema({
    email:{type:String,unique:true,required:true,validate:{
        validator:async (value)=>{
            let testForMatch=/^[A-Za-z0-9]+@postbank.bg$/.test(value);
            return testForMatch
            
        },
        message:(props)=>{return `Invalid pattern for email.` }
    }},
    branchNumber:{type:Number,required:true, min:1,max:999},
    branchName:{type:String,required:true},
    userStatus:{type:String, enum:['Active', 'Inactive']},
    role:{type:Types.ObjectId,ref:'Role',required:true}
});

userActiveDirSchema.index({email:1},{
    collation:{
        locale:'en',
        strength:2
    }
});


const UserActiveDir=model('UserActiveDir', userActiveDirSchema);

module.exports=UserActiveDir;