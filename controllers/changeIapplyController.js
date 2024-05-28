const { replaceIapplyTable } = require('../importExternalFiles/iApplyImports');

//This service is not used in the current version of the application

const changeIapplyController=require('express').Router();

changeIapplyController.get('/',async (req,res)=>{
    replaceIapplyTable();
    res.json({'hi':'hi'})


});




module.exports=changeIapplyController;