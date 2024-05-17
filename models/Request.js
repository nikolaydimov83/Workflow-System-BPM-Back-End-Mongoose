const { Schema, model,Types } = require("mongoose");
const { checkIapplyId, checkEGN, checkFinCen } = require("./validators/requestValidators");

//let arrayOfSubjects=['Чисто УВТ след ипотека','Вписване в ЦРОЗ','Удостоверение по ч. 87']

const requestSchema=new Schema({
    requestWorkflow:{type:Types.ObjectId,ref:'Workflow',required:true},
    deadlineDate:{type:Date, required:true,validate:{
        validator:async function (value){
            if (this.skipDeadlineDateValidation) {
                return true;
            }
            let today=new Date()
            today.setHours(0,0,0,0);
            value.setHours(0,0,0,0);
            return value>=today

        },
        message:(props)=>{return `${props.value} is past Date!` }
    }},
    status:{type:Types.ObjectId, ref:'Status'},
    statusIncomingDate:{type:Date, required:true},
    statusSender:{type:String,required:true},
    history:{type:[],default:[]},
    description:{type:String, minLength:5},
    finCenter:{type:Number,required:true,validate:{
        validator:checkFinCen,
        message:(props)=>{return `${props.value} is not a valid Branch Number` }
    }},
    refferingFinCenter:{type:Number,validate:{
        validator:checkFinCen,
        message:(props)=>{return `${props.value} is not a valid Branch Number` }
    }},
    iApplyId:{type:String,required:true,validate:{
        validator:checkIapplyId,
        message:(props)=>{return `${props.value} is not a valid I-applyId` }
    }},
    clientName:{type:String,required:true},
    clientEGFN:{type:String,required:true,validate:{
        validator:checkEGN,
        message:(props)=>{return `${props.value} is not a valid Bulstat/EGN` }
    }},
    product:{type:String,required:true},
    amount:{type:Number, min:1000},
    ccy:{type:String, enum:['BGN', 'EUR','USD','Other']},
    comments:{type:[Types.ObjectId],ref:'Comment',default:[]},
    subjectId:{type:Types.ObjectId, ref:'Subject',req:true},
    requestCreatorEmail:{type:String,ref:'User',req:true},
    skipDeadlineDateValidation:{type:Boolean,default:false}
});

requestSchema.index({iApplyId:1},{
    collation:{
        locale:'en',
        strength:2
    }
});

requestSchema.index({finCenter:1},{
    collation:{
        locale:'en',
        strength:2
    }
});

requestSchema.index({refferingFinCenter:1},{
    collation:{
        locale:'en',
        strength:2
    }
});


/*requestSchema.post('find', async function(docs) {
    for (const doc of docs) {
        await doc.populate('status requestWorkflow')

    }
    
});*/

/*requestSchema.post('findOne', async function(doc) {
   
        await doc.populate({path:'status',populate: { path: 'nextStatuses' }});
    
})*/


const Request=model('Request', requestSchema);

module.exports=Request;