
const { getRequestsByClientEGFN, sortTable, getRequestsBySearchString } = require('../services/requestServices');
const { parseError } = require('../utils/utils');

const searchController=require('express').Router();

searchController.post('/EGFN',async (req,res)=>{
    try {
        
        const EGFN=req.body.searchData;
        let serverResponseData=await getRequestsByClientEGFN(EGFN)
        res.status(201);
        res.json(serverResponseData);
    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

})

searchController.post('/all',async (req,res)=>{
    try {
        const page=Number(req.query.page);
        const searchString=req.body.searchString;
        let serverResponseData=await getRequestsBySearchString(searchString,page)
        res.status(201);
        res.json(serverResponseData);
    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

})
//
module.exports=searchController;