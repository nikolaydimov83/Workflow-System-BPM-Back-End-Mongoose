
const { getAllUserPendingRequests, sortTable, getRequestById, getUserRights, getAllPassedDeadlineUsrPndngReqs, getAllActiveReqs, getAllReqs } = require('../services/requestServices');
const { getWorkflowById } = require('../services/workflowServices');

const reportsContoller=require('express').Router();

reportsContoller.get('/',async (req,res)=>{
    let user=req.user;

   try {
    const page=Number(req.query.page);
    let pendingList=await getAllPassedDeadlineUsrPndngReqs(user,page)
    res.status(201);    
    res.json(pendingList);
   
    
   } catch (error) {
   console.log(error)
   }

});

reportsContoller.get('/active',async (req,res)=>{
    let user=req.user;
    

   try {
    let data=await getAllActiveReqs(user);
    res.status(201);    
    res.json(data);
   
    
   } catch (error) {
        console.log(error)
   }

});

reportsContoller.get('/all',async (req,res)=>{
    let user=req.user;
    const page=Number(req.query.page);

   try {
    let data=await getAllReqs(user,page);
    res.status(201);    
    res.json(data);
   
    
   } catch (error) {
   console.log(error)
   }

});


module.exports=reportsContoller;