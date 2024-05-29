const { getRequestHistoryById } = require('../services/requestServices');
const { parseError } = require('../utils/utils');

const historyController=require('express').Router();

historyController.get('/:id',async (req,res)=>{
        
   let id=req.params.id
   try {

    let historyList=await getRequestHistoryById(id)
    res.status(201);    
    res.json(historyList);
   } catch (error) {
    res.status(400);
    res.json({message:parseError(error)});
   }

});

module.exports=historyController;