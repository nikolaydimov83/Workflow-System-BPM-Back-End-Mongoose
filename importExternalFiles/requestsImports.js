const path = require('path');
const {baseDir} = require('../constants');
const { checkDelimeter } = require('./fileUtils');
const csv=require('csvtojson');
const logger  = require('../logger/logger');

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
        array.forEach(element => {
           const newElement=processElement(element) 
           const checks=checkArrayElementData(newElement) 
           logger.info({
                message: 'Transfer status for request migration',
                method: 'POST',
                url: 'N/A',
                ip: 'N/A',
                headers: 'N/A',
                query: 'N/A',
                body: element,
                responseStatus:'N/A',
                responseBody:checks
           });           
        });

        
    } catch (error) {
        return [{success:false,message:error.message}];
    }   

}

function checkArrayElementData(element){
    const checks={}
    checks.deadlineDate=checkDeadlineDate(element.deadlineDate);
    return checks;
}
function processElement(element){
    
    const newElement={...element}
    newElement.deadlineDate=element.deadlineDate.trim()
    return newElement
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
module.exports={migrateRequests}