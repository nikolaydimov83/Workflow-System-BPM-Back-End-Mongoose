const cron = require('node-cron');
const { replaceIapplyTable } = require('../importExternalFiles/csvImports');
const { extractZipArchive, renameFile } = require('../importExternalFiles/fileUtils');
const path = require('path');
const { baseDir } = require('../constants');

function scheduleUploadIApplyData(){
    cron.schedule('39 15 * * *', async () => {
        console.log('Running replaceIapplyTable() function...');
        try {
          const zipFilePath=path.join(baseDir,'importExternalFiles','csv','PlanB.zip');
          const destinationPath=path.join(baseDir,'importExternalFiles','csv');
          await extractZipArchive(zipFilePath, destinationPath);
          await renameFile(path.join(destinationPath,'Report 1.csv'),path.join(destinationPath,'iApply.csv'));
                    
          const result=await replaceIapplyTable();
          if (!result[0].success){
            throw new Error(result[0].message)
          }
        } catch (error) {
          console.log(error.message);
        }
      }, {
        scheduled: true,
        timezone: 'Europe/Sofia'
    });
}

module.exports={scheduleUploadIApplyData}