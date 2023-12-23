const { replaceIapplyTable } = require('../importExternalFiles/csvImports');


const changeIapplyController=require('express').Router();

changeIapplyController.get('/',async (req,res)=>{
    replaceIapplyTable();
    res.json({'hi':'hi'})


});




module.exports=changeIapplyController;