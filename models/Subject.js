const { Schema, model,Types } = require("mongoose");


const subjectSchema=new Schema({
    subjectName:{type:String, required:true, unique:true},
    subjectCreateDate:{type:Date,default:Date.now,immutable:true},
    assignedToWorkflow:{type:Types.ObjectId,ref:'Workflow',required:true}
});

subjectSchema.index({subjectName:1},{
    collation:{
        locale:'en',
        strength:2
    }
});


const Subject=model('Subject', subjectSchema);

module.exports=Subject;