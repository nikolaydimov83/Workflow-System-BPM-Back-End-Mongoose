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
const { checkFinCen } = require('../models/validators/requestValidators');

async function changeBranch(){

    const csvFilePath=path.join(baseDir,'importExternalFiles','csv','change_requests_branch.csv');
    const properHeadings=['finCenter','iApplyId'];
    let array=[]; 
    
    try {
        array=await csv({delimiter:';'}).fromFile(csvFilePath);
        csv()
        if (!checkDelimeter(array,properHeadings)){
            throw new Error('Wrong delimeter provided!')
        }
        for (const element of array) {
            const checks={finCen:false,iApplyCheck:false};  
            //await getUserByEmail(element.email)?checks.mailCheck=true:checks.mailCheck=false; 
            await checkFinCen(element.finCenter)?checks.finCen=true:checks.finCen==false;
            const requests=(await getRequestsByIApplyId(element.iApplyId))
            if (requests.length>0){
                checks.iApplyCheck=true;
            } 
            if (checks.finCen&&checks.iApplyCheck){
                for (const request of requests) {
                    request.finCenter=element.finCenter;
                    await request.save();
                    element.success=true;
                    element.message='Request Fin center updated successfully';
                    element.numberOfChangedRequests=requests.length;
                    loggerMigrations.info({
                        message: 'Request FinCenter updated successfully',
                        input:  {
                                requestForMigration:(request)
                                }
                   });                    
                }
               }else{
                element.success=false;
                element.message='iApplyId not found or Fin center wrong format';
                loggerMigrations.info({
                    message: 'iApplyId not found or Fin center wrong format',
                    input:(element)
               });
               }                         

        }
        return array;
        
    } catch (error) {
        return [{success:false,message:error.message}];
        
    }   

}

module.exports={changeBranch}