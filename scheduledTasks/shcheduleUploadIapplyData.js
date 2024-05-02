const cron = require('node-cron');
const { replaceIapplyTable } = require('../importExternalFiles/csvImports');

function scheduleUploadIApplyData(){
    cron.schedule('00 10 * * *', async () => {
        console.log('Running replaceIapplyTable() function...');
        try {
          await replaceIapplyTable();
        } catch (error) {
          console.log(error.message);
        }
      }, {
        scheduled: true,
        timezone: 'Europe/Sofia'
    });
}

module.exports={scheduleUploadIApplyData}