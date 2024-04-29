const { uploadUsersFromCSVFile } = require('../importExternalFiles/userActiveDirImports');
const { parseError } = require('../utils/utils');
const csv = require('csvtojson');
const fs = require('fs');
const path = require('path');
const { baseDir } = require('../constants');


const fileUploadsController=require('express').Router();

fileUploadsController.post('/usersFileUpload',async(req,res)=>{
    try {
        if (!req.headers['content-type'].startsWith('text/csv')) {
            throw new Error('Invalid file format')
          }
        
          
        let fileData = '';
        req.setEncoding('utf8');
        req.on('data', (chunk) => {
            fileData += extractBodyPart(chunk);
        });   
        req.on('end', () => {
            const csvFilePath=path.join(baseDir,'importExternalFiles','csv','users.csv');
            fs.writeFile(csvFilePath, fileData, async (err) => {
                if (err) {
                    throw new Error('Error writing file!')
                }
                let result=await uploadUsersFromCSVFile()
                const csvString = arrayToCSV(result)
                const fileName='exportUsers_'+(Date.now()).toString()+'.csv'
                const responseCsvFilePath=path.join(baseDir,'exports',fileName)
                fs.writeFile(responseCsvFilePath,csvString,async (err)=>{
                    if (err) {
                        throw new Error('Error writing file!')
                    }
                    res.download(responseCsvFilePath)
                })
               
            });
          });             
      
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

function extractBodyPart(chunk) {
    // Convert chunk to string
    const chunkString = chunk.toString();

    // Find the index of the start and end boundaries
    const startBoundaryIndex = chunkString.indexOf('\r\n\r\n')+4
    const endBoundaryIndex = chunkString.lastIndexOf('\n\r\n');

    // Extract the body part from the chunk
    const bodyPart = chunkString.slice(startBoundaryIndex, endBoundaryIndex);

    return bodyPart;
}

function arrayToCSV(arr) {
    const header=Object.keys(arr[0]).join(',')
    const body= arr.map(object=>(Object.values(object).join(','))).join('\n')
    const result= [header,body].join('\n')
    return result
}

module.exports=fileUploadsController