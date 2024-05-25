const { uploadUsersFromCSVFile, editUsersFromCSVFile } = require('../importExternalFiles/userActiveDirImports');
const { parseError } = require('../utils/utils');

const path = require('path');
const { baseDir } = require('../constants');
const { processExternalCsvFile, deleteFileAsync } = require('../importExternalFiles/fileUtils');
const { replaceIapplyTable } = require('../importExternalFiles/iApplyImports');
const { migrateRequests } = require('../importExternalFiles/requestsImports');
const { changeOwners } = require('../importExternalFiles/requestsOwnerChange');
const { changeBranch } = require('../importExternalFiles/requestsBranchChange');


const fileUploadsController=require('express').Router();

fileUploadsController.post('/usersFileUpload',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'users.csv',uploadUsersFromCSVFile);           
      
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

fileUploadsController.post('/usersFileEdit',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'editUsers.csv',editUsersFromCSVFile)
                  
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});


fileUploadsController.post('/manuallyUploadIapplyData',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'iApply.csv',replaceIapplyTable)           
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});

fileUploadsController.post('/migrateRequests',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'requests.csv',migrateRequests)           
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});

fileUploadsController.post('/changeOwners',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'change_requests_owner.csv',changeOwners)           
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});

fileUploadsController.post('/changeBranch',async(req,res)=>{
    try {
        await processIncomingCSVFile(req,res,'change_requests_branch.csv',changeBranch)           
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});
async function processIncomingCSVFile(req, res, filename,processingFunction,functionOnFinish) {
    try {
        if (!req.headers['content-type'].startsWith('text/csv')) {
            throw new Error('Invalid file format')
          }
           
        let fileData = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            fileData += chunk
        });   
        req.on('end', async () => {
            fileData=fileData.trim();
            const result= await processExternalCsvFile(filename,processingFunction,fileData)
            if (!result.message){
                res.download(result)
                res.on('finish',async()=>{
                    if (functionOnFinish){
                       functionOnFinish(result); 
                    }
                    
                })
            }else{
                throw result
            }
        });             
      
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
}

//changeOwners
module.exports=fileUploadsController