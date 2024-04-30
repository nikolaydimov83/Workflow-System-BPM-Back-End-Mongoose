const path = require('path');
const csv=require('csvtojson');
const { baseDir } = require('../constants');
const logger = require('../logger/logger');
const { createUsers } = require('../services/adminServices');

async function uploadUsersFromCSVFile(){
    const csvFilePath=path.join(baseDir,'importExternalFiles','csv','users.csv');
    let array=[]
    try {
        array=await csv().fromFile(csvFilePath)
        const result=await createUsers(array)
        result.forEach((entry)=>{
                logger.info({
                  message: entry.message,
                  method: 'POST',
                  url: 'N/A',
                  ip: 'N/A',
                  headers: {},
                  query: {},
                  body: {...entry}
                });
        })
    if (result.length===0){
        console.log()
    }
    return result
    } catch (error) { 
        console.log(error.message);
    }
}

async function editUsersFromCSVFile(){
    const csvFilePath=path.join(baseDir,'importExternalFiles','csv','editUsers.csv');
    let array=[]
    try {
        array=await csv().fromFile(csvFilePath)
        const result=await createUsers(array)
        result.forEach((entry)=>{
                logger.info({
                  message: entry.message,
                  method: 'POST',
                  url: 'N/A',
                  ip: 'N/A',
                  headers: {},
                  query: {},
                  body: {...entry}
                });
        })

    return result
    } catch (error) { 
        console.log(error.message);
    }
}

module.exports={uploadUsersFromCSVFile,editUsersFromCSVFile}