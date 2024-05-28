const path = require('path');
const csv=require('csvtojson');
const IApply = require('../models/IApply');
const mongoose=require('mongoose');
const { baseDir } = require('../constants');
const logger = require('../logger/logger');
const { checkIapplyId, checkEGN, checkFinCen } = require('../models/validators/requestValidators');
const LastIssueLog = require('../models/LastIssueLog');
const { checkDelimeter, extractZipArchive } = require('./fileUtils');
const loggerIapply = require('../logger/iapplyLogger');


async function replaceIapplyTable(){


const csvFilePath=path.join(baseDir,'importExternalFiles','csv','iApply.csv');
const properHeadings=['iApplyId','clientName','clientEGFN','product','amount','ccy','finCenter','refferingFinCenter']
let array=[]
let result=[{success:true}]
try {
    array=await csv({
      delimiter:',"€$)*!",'
    }).fromFile(csvFilePath)
    if (!checkDelimeter(array,properHeadings)){
      throw new Error('Wrong delimeter provided!')
    }
    let wrongElements=await cleanArray(array)
    await performTransaction(array)
    wrongElements.map(element=>loggerIapply.info(element))

    result[0].message='';
    result[0].success=true;
    return result
} catch (error) {
    
  result[0].success=false
  result[0].message=error.message
  return result
    
}
}
let unacceptableFinCenters=['BLBRO', 'WEBAPPL', 'FC000', 'FC099','BRO']
let handledFinCenExceptions=["FC099",'BLBRO411','FC000','BLBRO501',"","BLBRO411","WEBAPPL","BRO"]
let handledEGNExceptionsRegEx=/^10000[0-9]{10}$/
async function checkArrayElementData(element){
 
  let isIApplyIdCorrect=(await checkIapplyId(element.iApplyId))
  let isEGNCorrect=(await checkEGN(element.clientEGFN))
  let isFinCentCorrect=(await checkFinCen(element.finCenter))
  let isRefFinCentCorrect=(await checkFinCen(element.refferingFinCenter))
  if (!element.iApplyId){
    console.log(element)
  }
  if (handledFinCenExceptions.includes(element.refferingFinCenter)){
    isRefFinCentCorrect=true
  }

  if (handledEGNExceptionsRegEx.test(element.clientEGFN)){
    isEGNCorrect=true
  }
  

  if (!isIApplyIdCorrect||!isEGNCorrect||!isFinCentCorrect||!isRefFinCentCorrect){
     return {
      message: 'Incoming Incorect I-apply Data',
      method: 'POST',
      url: 'N/A',
      ip: 'N/A',
      headers: {},
      query: {},
      body: {...element},
      newBody:element,
      reasons:{isIApplyIdCorrect, isEGNCorrect, isFinCentCorrect, isRefFinCentCorrect}
    }
     
  }

}
async function cleanArray(array){
  const wrongElements=[]
  for (const key in array) {
      const element = array[key];
      const wrongElement=await checkArrayElementData(element)
      if (wrongElement){
        wrongElements.push(wrongElement)
      }
     element.amount=element.amount.replace(',','.')
      /*element.amount=element.amount.replace(',','')
      element.amount=element.amount.replace(',','')*/
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
    return wrongElements
  }

async function performTransaction(newData) {
    const session = await mongoose.startSession();
    session.startTransaction();  
  
    try {
      await IApply.deleteMany({}, { session });
      await IApply.insertMany(newData, { session });
      let lastTimeStamp=await LastIssueLog.find({})
      if (!lastTimeStamp[0]){
        LastIssueLog.create({timestamp:new Date()});
      }else{
        lastTimeStamp[0].timestamp=new Date()
        lastTimeStamp[0].save()
      }
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