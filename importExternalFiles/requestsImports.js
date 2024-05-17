const path = require('path');
const {baseDir} = require('../constants');
const { checkDelimeter } = require('./fileUtils');
const csv=require('csvtojson');
const logger  = require('../logger/logger');
const { checkIapplyId, checkFinCen } = require('../models/validators/requestValidators');
const { getAllStatuses, getStatusById } = require('../services/statusServices');
const { getUserByEmail } = require('../services/adminServices');
const { get } = require('http');
const { getWorkflowById } = require('../services/workflowServices');
const { readIapplyData } = require('../services/iapplyServices');
const { findSubjectByWorkflowId } = require('../services/subjectServices');
const { create } = require('../models/Role');
const { createRequest } = require('../services/requestServices');

async function migrateRequests(){

    const csvFilePath=path.join(baseDir,'importExternalFiles','csv','requests.csv');
    const properHeadings=['deadlineDate','iApplyId','finCenter','status','requestCreatorEmail','description','requestWorkflow'];
    let array=[]; 
    
    try {
        array=await csv({delimiter:';'}).fromFile(csvFilePath);
        csv()
        if (!checkDelimeter(array,properHeadings)){
            throw new Error('Wrong delimeter provided!')
        }

        const promises=array.map(async (element) => {
           const newElement=processElement(element);
           const checks=await checkArrayElementData(newElement);
           if (checks.deadline&&checks.descr&&checks.email&&checks.finCen&&checks.iApply&&checks.stat&&checks.workflow){
            return ({...newElement,...checks})
           }else{
                return undefined;
           }
                                 
        });
        const result=(await Promise.all(promises)).filter((item)=>item!==undefined);
        const promisesForRequestCreateInDb=result.map(async (element) => { 
                const requestForMigration=await prepareRequestForMigration(element);
                try {
                    await createRequest(requestForMigration);
                    element.success=true;
                    element.message='Request created successfully';
                   /* logger.info({
                        message: 'Transfer status for request migration',
                        method: 'POST',
                        url: 'N/A',
                        ip: 'N/A',
                        headers: 'N/A',
                        query: 'N/A',
                        body: element,
                        responseStatus:'N/A',
                        responseBody:requestForMigration
                   }); */
                    if(!element){
                        console.log()
                    }
                    return element;

                }catch (error){
                    element.success=false;
                    element.message=error.message;
                    return element;
                    
                }
        })
        const resultForRequestCreateInDb=await Promise.all(promisesForRequestCreateInDb);
        return resultForRequestCreateInDb;
        
    } catch (error) {
        return [{success:false,message:error.message}];
    }   

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
function processElement(element){
    
    const newElement={...element}
    newElement.deadlineDate=element.deadlineDate.trim()
    newElement.iApplyId=element.iApplyId.trim()
    newElement.iApplyId=element.iApplyId.toUpperCase()
    return newElement
}

async function checkStatusValidity(status){
    const statusesCurrentlyInDB=(await getAllStatuses()).map((s)=>s._id.toString());
    
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
    if (iApplyId==='HL145860'){
        console.log();
    }
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

async function prepareRequestForMigration(requestForMigration) {
    const old={...requestForMigration};
    splittedDeadlineDate=requestForMigration.deadlineDate.split('.');
    requestForMigration.deadlineDate=new Date(splittedDeadlineDate[2],splittedDeadlineDate[1]-1,splittedDeadlineDate[0]);
    requestForMigration.statusIncomingDate = (new Date())
    requestForMigration.statusSender = requestForMigration.requestCreatorEmail;

    requestForMigration.history = [];
    requestForMigration.status = await getStatusById(requestForMigration.status);
    let historyEntry = { status:requestForMigration.status, 
                        incomingDate: requestForMigration.statusIncomingDate, 
                        statusSender: requestForMigration.requestCreatorEmail 
                    };
    
    requestForMigration.history.push(historyEntry);
    requestForMigration.status=requestForMigration.status._id;
    let iApplyData = await readIapplyData(requestForMigration.iApplyId);
    if (!iApplyData){
        console.log()
    }    
    requestForMigration.amount = iApplyData.amount;

    requestForMigration.ccy = iApplyData.ccy;
    requestForMigration.clientEGFN = iApplyData.clientEGFN;
    requestForMigration.clientName = iApplyData.clientName;
    requestForMigration.iApplyId = iApplyData.iApplyId;
    requestForMigration.product = iApplyData.product;
    requestForMigration.refferingFinCenter = iApplyData.refferingFinCenter;
    requestForMigration.subjectId = (await findSubjectByWorkflowId(requestForMigration.requestWorkflow))._id; 
    requestForMigration.requestWorkflow = (await getWorkflowById(requestForMigration.requestWorkflow))._id
    requestForMigration.skipDeadlineDateValidation = true;
    return requestForMigration;
}

module.exports={migrateRequests}