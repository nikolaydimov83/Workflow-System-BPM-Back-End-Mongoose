const path = require('path');
const csv=require('csvtojson');
const IApply = require('../models/IApply');
const mongoose=require('mongoose');
const { baseDir } = require('../constants');

async function replaceIapplyTable(){

const csvFilePath=path.join(baseDir,'importExternalFiles','csv','iApply.csv');

let array=[]
try {
    array=await csv({
      delimiter:',"€$)*!",'
    }).fromFile(csvFilePath)
    cleanArray(array)
    await performTransaction(array)
} catch (error) {
    
  console.log(error.message);
    
}



}
let unacceptableFinCenters=['BLBRO', 'WEBAPPL', 'FC000']
function cleanArray(array){
  array.forEach(element => {
    element.amount=element.amount.replace(',','')
    element.amount=element.amount.replace(',','')
    element.amount=element.amount.replace(',','')
    element.clientEGFN=element.clientEGFN.trim()
    
    if (element.clientEGFN.length>10){
      element.clientEGFN=element.clientEGFN.slice(element.clientEGFN.length-10)
    }
    unacceptableFinCenters.forEach((center)=>{
      element.refferingFinCenter=element.refferingFinCenter.replace(center,'')
      if (isNaN(element.refferingFinCenter)){
        element.refferingFinCenter=''
      }
    })
  });
}
async function performTransaction(newData) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      await IApply.deleteMany({}, { session });
      await IApply.insertMany(newData, { session });
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
module.exports={replaceIapplyTable}