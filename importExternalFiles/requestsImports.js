const path = require('path');
const {baseDir} = require('../constants');
const { checkDelimeter } = require('./fileUtils');
const csv=require('csvtojson');
const { getWorkflowById } = require('../services/workflowServices');
const { readIapplyData } = require('../services/iapplyServices');
const { findSubjectByWorkflowId } = require('../services/subjectServices');
const { createRequest } = require('../services/requestServices');
const loggerMigrations = require('../logger/migrationsLogger');
const { checkArrayElementData, sanitizeElement } = require('./requestDataChecks');
const { getStatusById } = require('../services/statusServices');

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
           const newElement=sanitizeElement(element);
           const checks=await checkArrayElementData(newElement);
           if (checks.deadline&&checks.descr&&checks.email&&checks.finCen&&checks.iApply&&checks.stat&&checks.workflow){
            return ({...newElement,...checks})
           }else{
                return undefined;
           }
                                 
        });
        const result=(await Promise.all(promises)).filter((item)=>item!==undefined);
        const promisesForRequestCreateInDb=result.map(async (element) => { 
                try {
                const requestForMigration=await prepareRequestForMigration(element);
                
                    await createRequest(requestForMigration);
                    element.success=true;
                    element.message='Request created successfully';
                    loggerMigrations.info({
                        message: 'Request created successfully',
                        input:  {
                                requestForMigration:convertRequestModelToObject(requestForMigration)
                                }
                   });

                    return element;

                }catch (error){
                    element.success=false;
                    element.message=error.message;
                    loggerMigrations.info({
                        message: error.message,
                        input:convertRequestModelToObject(element)
                   });
                    return element;
                    
                }
        })
        const resultForRequestCreateInDb=await Promise.all(promisesForRequestCreateInDb);
        return resultForRequestCreateInDb;
        
    } catch (error) {
        return [{success:false,message:error.message}];
        
    }   

}

async function prepareRequestForMigration(requestForMigration) {

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

function convertRequestModelToObject(request){
    const requestObject={...request};
    if (!requestObject.requestWorkflow._id){
        console.log()
    }

    if (!requestObject.subjectId._id){
        console.log()
    }

    if (!requestObject.subjectId._id){
        console.log()
    }
    requestObject.status = requestObject.status?._id.toString();
    requestObject.requestWorkflow = requestObject.requestWorkflow._id.toString();
    requestObject.subjectId = requestObject.subjectId._id.toString();
    requestObject.history=requestObject.history.map((entry)=>entry.status._id.toString());
    return requestObject;

}
module.exports={migrateRequests}