const { getAllIApplyDataWrong } = require('../services/logServices');
const { parseError } = require('../utils/utils');

const loggerController=require('express').Router();

loggerController.get('/',async(req,res)=>{
    try {
        const page=Number(req.query.page);
        const pageSize=500;
        let data=await getAllIApplyDataWrong(page,pageSize);
        res.status(201);
        res.json({result:data.result,searchContextString:'',collectionLength:data.totalCount})


        

        } catch (error) {
            res.status(401);
            res.json({message:parseError(error)});
        }


});



module.exports=loggerController;


