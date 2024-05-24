const path = require('path');
const {baseDir} = require('../constants');
const { checkDelimeter } = require('./fileUtils');
const csv=require('csvtojson');
const { getWorkflowById } = require('../services/workflowServices');
const { readIapplyData } = require('../services/iapplyServices');
const { findSubjectByWorkflowId } = require('../services/subjectServices');
const { createRequest, getRequestsByIApplyId } = require('../services/requestServices');
const loggerMigrations = require('../logger/migrationsLogger');
const { checkArrayElementData, sanitizeElement } = require('./requestDataChecks');
const { getStatusById } = require('../services/statusServices');
const { getUserByEmail } = require('../services/adminServices');

async function changeOwners(){

    const csvFilePath=path.join(baseDir,'importExternalFiles','csv','change_requests_owner.csv');
    const properHeadings=['email','iApplyId'];
    let array=[]; 
    
    try {
        array=await csv({delimiter:';'}).fromFile(csvFilePath);
        csv()
        if (!checkDelimeter(array,properHeadings)){
            throw new Error('Wrong delimeter provided!')
        }
        for (const element of array) {
            const checks={mailCheck:false,iApplyCheck:false};  
            await getUserByEmail(element.email)?checks.mailCheck=true:checks.mailCheck=false; 
            const requests=(await getRequestsByIApplyId(element.iApplyId))
            if (requests.length>0){
                checks.iApplyCheck=true;
            } 
            if (checks.mailCheck&&checks.iApplyCheck){
                for (const request of requests) {
                    request.requestCreatorEmail=element.email;
                    await request.save();
                    element.success=true;
                    element.message='Request created successfully';
                    element.numberOfChangedRequests=requests.length;
                    loggerMigrations.info({
                        message: 'Request created successfully',
                        input:  {
                                requestForMigration:(request)
                                }
                   });                    
                }
               }else{
                element.success=false;
                element.message='User or iApplyId not found';
                loggerMigrations.info({
                    message: 'User or iApplyId not found',
                    input:(element)
               });
               }                         

        }
        return array;
        
    } catch (error) {
        return [{success:false,message:error.message}];
        
    }   

}

function convertRequestModelToObject(request){
    const requestObject={...request};

    requestObject.status = requestObject.status?._id.toString();
    requestObject.requestWorkflow = requestObject.requestWorkflow._id.toString();
    requestObject.subjectId = requestObject.subjectId._id.toString();
    requestObject.history=requestObject.history.map((entry)=>entry.status._id.toString());
    return requestObject;

}
module.exports={changeOwners}