const path=require('path')
const { baseDir } = require('../constants');
const fs=require('fs')
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const deleteFileAsync = promisify(fs.unlink);
const AdmZip = require('adm-zip');
const renameFileAsync = promisify(fs.rename);

async function deleteCSVFile(filePath){
    deleteFileAsync(filePath);
}

async function renameFile(oldPath, newPath) {
    try {
        await renameFileAsync(oldPath, newPath);
        console.log('File renamed successfully');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}
async function processExternalCsvFile(filename, proccessingFunction,fileData){
    const csvFilePath=path.join(baseDir,'importExternalFiles','csv',filename);
    let responseCsvFileProcess;
    let processedFileData=extractBodyPart(fileData);
    processedFileData=processedFileData.trim()
    await writeFileAsync(csvFilePath, processedFileData);
        try {
            let result=await proccessingFunction()
            responseCsvFileProcess = await createCSVFileFromArray(result, filename);
            
    
        } catch (error) {
            return error
        }
       
    
    return responseCsvFileProcess
}

async function createCSVFileFromArray(array, filename) {
    const csvString = arrayToCSV(array) || '';
    const fileName = 'export' + filename + '_' + (Date.now()).toString() + '.csv';
    let responseCsvFileProcess = path.join(baseDir, 'exports', fileName);
    await writeFileAsync(responseCsvFileProcess, csvString);
    return responseCsvFileProcess;
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
    const header=Object.keys(arr[0]).join(';')
    const body= arr.map((object)=>(Object.values(object).join(';'))).join('\n')
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

async function extractZipArchive(zipFilePath, destinationPath) {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(destinationPath, true);
}

module.exports={processExternalCsvFile,
                deleteFileAsync,
                checkDelimeter,
                createCSVFileFromArray,
                extractZipArchive,
                renameFile
            }