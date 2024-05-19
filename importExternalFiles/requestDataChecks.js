const { checkIapplyId, checkFinCen } = require("../models/validators/requestValidators");
const { getUserByEmail } = require("../services/adminServices");
const { readIapplyData } = require("../services/iapplyServices");
const { getAllStatuses } = require("../services/statusServices");
const { getWorkflowById } = require("../services/workflowServices");

async function checkStatusValidity(status){

    const statusesCurrentlyInDB=(await getAllStatuses()).map((s)=>{
        if (!s){
            console.log();
        }
        return s._id.toString()
    });
    
    if (!statusesCurrentlyInDB.includes(status)){
        return false
    }else{
        return true
    
    }
}
function checkDescription(description){ 
    if (!description||description.length<5){
        return false
    }else{
        return true
    }
}

async function checkEmail(email){
    user=await getUserByEmail(email);
    if (user){
        return true 
    }else{  
        return false
    }        
}
async function checkRequestedWorkflow(requestedWorkflow){
    const workflow=await getWorkflowById(requestedWorkflow);
    if (workflow){
        return true
    }else{
        return false
    }
}
async function crossCheckIapplyId(iApplyId){
    if (!await checkIapplyId(iApplyId)){
        return false
    }
    const iApplyDataInDB=await readIapplyData(iApplyId);
    if (!iApplyDataInDB){
        return false
    }else{  
        return true
    }
}

function checkDeadlineDate(stringDate){
stringDate=stringDate.trim();
let splittedDate=stringDate.split('.');
if (splittedDate.length!==3){
    return false;
}
if (splittedDate[0].length!==2 || splittedDate[1].length!==2 || splittedDate[2].length!==4){
    return false;
}
if (isNaN(splittedDate[0]) || isNaN(splittedDate[1]) || isNaN(splittedDate[2])){
    return false;
}
if (splittedDate[0]<1 || splittedDate[0]>31 || splittedDate[1]<1 || splittedDate[1]>12 || splittedDate[2]<1900 || splittedDate[2]>2040){
    return false;
}
if (  [3, 5, 8,10].includes(splittedDate[1]) && splittedDate[0]>30){
    return false;
}
if (  [0, 2, 4,6,7,9, 11].includes(splittedDate[1]) && splittedDate[0]>31){
    return false;
}
if (  [1].includes(splittedDate[1]) && splittedDate[0]>29){
    return false;
}
return true
}

async function checkArrayElementData(element){
    const checks={}
    checks.deadline=checkDeadlineDate(element.deadlineDate);
    checks.iApply=await crossCheckIapplyId(element.iApplyId);
    checks.finCen=await checkFinCen(element.finCenter);
    checks.stat=await checkStatusValidity(element.status);
    checks.email=await checkEmail(element.requestCreatorEmail);
    checks.descr=checkDescription(element.description);
    checks.workflow=await checkRequestedWorkflow(element.requestWorkflow);

    return checks;
}

function sanitizeElement(element){
    
    const newElement={...element}
    newElement.deadlineDate=element.deadlineDate.trim()
    newElement.iApplyId=element.iApplyId.trim()
    newElement.iApplyId=element.iApplyId.toUpperCase()
    return newElement
}

module.exports={checkArrayElementData,checkStatusValidity,checkEmail,checkDescription,checkRequestedWorkflow,crossCheckIapplyId,checkDeadlineDate,sanitizeElement}