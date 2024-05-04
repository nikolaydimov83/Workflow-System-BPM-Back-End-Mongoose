const path=require('path')
const { baseDir } = require('../constants');
const fs=require('fs')
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const deleteFileAsync = promisify(fs.unlink);

async function deleteCSVFile(filePath){
    deleteFileAsync(filePath);
}
async function processExternalCsvFile(filename, proccessingFunction,fileData){
    const csvFilePath=path.join(baseDir,'importExternalFiles','csv',filename);
    let responseCsvFileProcess;
    processedFileData=extractBodyPart(fileData);
    await writeFileAsync(csvFilePath, processedFileData);
        try {
            let result=await proccessingFunction()
            const csvString = arrayToCSV(result)||''
            const fileName='export'+filename+'_'+(Date.now()).toString()+'.csv'
            responseCsvFileProcess=path.join(baseDir,'exports',fileName)

            await writeFileAsync(responseCsvFileProcess,csvString)
            
    
        } catch (error) {
            return error
        }
       
    
    return responseCsvFileProcess   
}

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
    if (arr&&arr.length>0){
    const header=Object.keys(arr[0]).join(',')
    const body= arr.map(object=>(Object.values(object).join(','))).join('\n')
    const result= [header,body].join('\n')
    return result        
}

}

function checkDelimeter(array, properHeadings){
    let result=true
    properHeadings.forEach((heading)=>{
        if (!(Object.keys(array[0]).includes(heading))){
            result=false
        }
    })
    return result
}

module.exports={processExternalCsvFile,deleteFileAsync,checkDelimeter}