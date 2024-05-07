const { getAllIApplyDataWrong } = require('../services/logServices');
const { parseError } = require('../utils/utils');





const loggerController=require('express').Router();

loggerController.get('/',async(req,res)=>{
    try {
        page=Number(req.query.page);
        let data=await getAllIApplyDataWrong();
            data.sort((a,b)=>a._id-b._id);
            const result=data.slice((page-1)*10,page*10);
            res.status(201);
            res.json({result,searchContextString:'',collectionLength:data.length})


        

        } catch (error) {
            res.status(401);
            res.json({message:parseError(error)});
        }


});



module.exports=loggerController;


