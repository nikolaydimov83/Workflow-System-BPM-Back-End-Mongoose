const { getAllUserPendingRequests, getRequestById, getUserRights } = require('../services/requestServices');
const { getAllClosedStatuses } = require('../services/statusServices');
const { getWorkflowById } = require('../services/workflowServices');
const { parseError } = require('../utils/utils');

const dataController=require('express').Router();

dataController.get('/',async (req,res)=>{
    let user=req.user;
    const page=Number(req.query.page);
   try {

    let pendingList=await getAllUserPendingRequests(user,page)
    res.status(201);    
    res.json(pendingList);
   
    
   } catch (error) {
    res.status(400);
    res.json({message:parseError(error)});
   }

});

dataController.post('/',async (req,res)=>{
   let user=req.user;
   try {
    data=await getAllUserPendingRequests(user);
    res.status(201);    
    res.json(data);
   } catch (error) {
    res.status(400);
    res.json({message:parseError(error)});
   }

});

dataController.get('/:id',async (req,res)=>{ 
    
    let id=req.params.id

    try {
        let request=await getRequestById(id)
        let userRigths=(await getUserRights(request,req.user));
        let closedStatuses=await getAllClosedStatuses();
        let isRequestStatusClosed=closedStatuses.findIndex((closedStatus)=>closedStatus.id==request.status.statusType)>-1
        if(userRigths.userPrivileged&&!isRequestStatusClosed){
            const workflowFromDB=await getWorkflowById(request.requestWorkflow)
            const additionalNextStatuses=workflowFromDB.allowedStatuses
                .filter((status)=>{
                    let a=closedStatuses.findIndex((closedStatus)=>{
                        return closedStatus.id==status.id
                    })
                    return a>-1
            
            })

            
            additionalNextStatuses.forEach((newNextStat)=>{
                if((request.status.nextStatuses.filter((status)=>status._id==newNextStat.id)).length==0){
                    request.status.nextStatuses.push(newNextStat)
                }
                
            })
        }
        request.checkUserCanChangeStatus=userRigths.userCanChangeStatus;
        request.privilegedUser=userRigths.userPrivileged;
        res.status(201);    
        res.json(request); 
   } catch (error) {
    res.status(400);
    res.json({message:parseError(error)});
   }

});

module.exports=dataController;