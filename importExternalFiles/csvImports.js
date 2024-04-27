const path = require('path');
const csv=require('csvtojson');
const IApply = require('../models/IApply');
const mongoose=require('mongoose');
const { baseDir } = require('../constants');
const logger = require('../logger/logger');
const { checkIapplyId, checkEGN, checkFinCen } = require('../models/validators/requestValidators');
async function replaceIapplyTable(){

const csvFilePath=path.join(baseDir,'importExternalFiles','csv','iApply.csv');

let array=[]
try {
    array=await csv({
      delimiter:',"€$)*!",'
    }).fromFile(csvFilePath)
    await cleanArray(array)
    await performTransaction(array)
} catch (error) {
    
  console.log(error.message);
    
}


}
let unacceptableFinCenters=['BLBRO', 'WEBAPPL', 'FC000', 'FC099']
let handledFinCenExceptions=["FC099",'BLBRO411','FC000','BLBRO501',"","BLBRO411","WEBAPPL","BRO"]
let handledEGNExceptionsRegEx=/^10000[0-9]{10}$/
async function checkArrayElementData(element){
  let isIApplyIdCorrect=(await checkIapplyId(element.iApplyId))
  let isEGNCorrect=(await checkEGN(element.clientEGFN))
  let isFinCentCorrect=(await checkFinCen(element.finCenter))
  let isRefFinCentCorrect=(await checkFinCen(element.refferingFinCenter))
  if (handledFinCenExceptions.includes(element.refferingFinCenter)){
    isRefFinCentCorrect=true
  }

  if (handledEGNExceptionsRegEx.test(element.clientEGFN)){
    isEGNCorrect=true
  }
  

  if (!isIApplyIdCorrect||!isEGNCorrect||!isFinCentCorrect||!isRefFinCentCorrect){
    logger.info({
      message: 'Incoming Incorect I-apply Data',
      method: 'POST',
      url: 'N/A',
      ip: 'N/A',
      headers: {},
      query: {},
      body: element,
      reasons:{isIApplyIdCorrect, isEGNCorrect, isFinCentCorrect, isRefFinCentCorrect}
    });

  }

}
async function cleanArray(array){
  for (const key in array) {
      const element = array[key];
      await checkArrayElementData(element)
      element.amount=element.amount.replace(',','')
      element.amount=element.amount.replace(',','')
      element.amount=element.amount.replace(',','')
      element.clientEGFN=element.clientEGFN.trim()
      
      if (element.clientEGFN.length>10){
        if (element.clientEGFN.startsWith("700000")&&element.clientEGFN.length==15){
          element.clientEGFN=element.clientEGFN.replace("700000","")
        }else{
          element.clientEGFN=element.clientEGFN.slice(element.clientEGFN.length-10)
        }
        
      }
      unacceptableFinCenters.forEach((center)=>{
        element.refferingFinCenter=element.refferingFinCenter.replace(center,'')
        if (isNaN(element.refferingFinCenter)){
          element.refferingFinCenter=''
        }
      })
    }
  }

async function performTransaction(newData) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      await IApply.deleteMany({}, { session });
      await IApply.insertMany(newData, { session });
      await session.commitTransaction();
      console.log('I-apply transfer successfull!')
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
module.exports={replaceIapplyTable}