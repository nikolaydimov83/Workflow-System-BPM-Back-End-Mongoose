const IApply = require('../models/IApply');
const { readIapplyData } = require('../services/iapplyServices');
const { parseError } = require('../utils/utils');

const iApplyConroller=require('express').Router();

iApplyConroller.get('/:id',async (req,res)=>{
    try {
        let iApplyId=req.params.id
        let iApplyData=await readIapplyData(iApplyId)
    
        if(!iApplyData){
            throw new Error('I-apply ID not found!');
        }
        if(!iApplyData.refferingFinCenter){
            iApplyData.refferingFinCenter='';
        }
        res.status(201);
        res.json({iApplyData});
    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

})
//
module.exports=iApplyConroller;