const { uploadUsersFromCSVFile, editUsersFromCSVFile } = require('../importExternalFiles/userActiveDirImports');
const { parseError } = require('../utils/utils');

const path = require('path');
const { baseDir } = require('../constants');
const { processExternalCsvFile, deleteFileAsync } = require('../importExternalFiles/fileUtils');


const fileUploadsController=require('express').Router();

fileUploadsController.post('/usersFileUpload',async(req,res)=>{
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
            const result= await processExternalCsvFile('users.csv',uploadUsersFromCSVFile,fileData)
            if (!result.message){
                res.download(result)
            }else{
                throw result
            }
        });             
      
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

fileUploadsController.post('/usersFileEdit',async(req,res)=>{
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
            const result= await processExternalCsvFile('editUsers.csv',editUsersFromCSVFile,fileData)
            if (!result.message){
                res.download(result)
                res.on('finish',async()=>{
                    deleteFileAsync(result);
                })

            }else{
                throw result
            }
        });             
      
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});





module.exports=fileUploadsController