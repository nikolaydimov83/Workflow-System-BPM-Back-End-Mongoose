
const { getAllStatuses, createStatus, getStatusById, editStatus } = require('../services/statusServices');
const { getAllSubjects, createSubject, editSubjectById, getSubjectById } = require('../services/subjectServices');
const { createRole, getAllRoles, getRoleById, editRole, getAllWorkflows, createWorkflow, getWorkflowById, editWorkflow } = require('../services/workflowServices');
const { parseError } = require('../utils/utils');


const workflowController=require('express').Router();

workflowController.post('/roles',async(req,res)=>{
    try {
        
        let data=await createRole(req.body);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.get('/roles',async(req,res)=>{
    try {
        
        let data=await getAllRoles();
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});



workflowController.get('/roles/:id',async(req,res)=>{
    try {
        let id=req.params.id
        let data=await getRoleById(id)
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.put('/roles/:id',async(req,res)=>{
    try {
        let id=req.params.id
        let data=await editRole(req.body,id);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.get('/statuses',async(req,res)=>{
    try {
        
        let data=await getAllStatuses();
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});
workflowController.get('/statuses/:id',async(req,res)=>{
    try {
        
        let data=await getStatusById(req.params.id);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});
workflowController.put('/statuses/:id',async(req,res)=>{
    try {
        assignNextStatusesAsArray(req);
        let statusInfo=req.body;
        statusInfo.id=req.params.id;
        let data=await editStatus(statusInfo);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});
workflowController.post('/statuses',async(req,res)=>{
    
    try {
        assignNextStatusesAsArray(req);
        let data =await createStatus(req.body);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
})

workflowController.get('/workflows',async(req,res)=>{
    try {
        
        let data=await getAllWorkflows();
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.post('/workflows',async(req,res)=>{
    try {
        let workflowName=req.body.workflowName;
        let initialStatus=req.body.initialStatus;
        assignRolesAllowedToFinishRequestAsArray(req)
        let rolesAllowedToFinishRequest=req.body.rolesAllowedToFinishRequest
        
        let data=await createWorkflow(workflowName,initialStatus,rolesAllowedToFinishRequest)
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.get('/workflows/:id',async(req,res)=>{
    try {
        
        let data=await getWorkflowById(req.params.id);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.put('/workflows/:id',async(req,res)=>{
    try {
        assignRolesAllowedToFinishRequestAsArray(req)
        let workflowInfo=req.body;
        workflowInfo.id=req.params.id;
        let data=await editWorkflow(workflowInfo);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.get('/subjects',async(req,res)=>{
    try {
        
        let data=await getAllSubjects();
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.post('/subjects',async(req,res)=>{
    try {
        
        let data=await createSubject(req.body);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.put('/subjects/:id',async(req,res)=>{
    try {
        
        let data=await editSubjectById(req.params.id,req.body);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

workflowController.get('/subjects/:id',async(req,res)=>{
    try {
        
        let data=await getSubjectById(req.params.id);
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

module.exports=workflowController;


function assignNextStatusesAsArray(req) {
    if (!req.body.nextStatuses) {
        req.body.nextStatuses = [];
    } else {
        if (req.body.nextStatuses.constructor !== Array) {
            req.body.nextStatuses = [req.body.nextStatuses];
        }
    }
}

function assignRolesAllowedToFinishRequestAsArray(req) {
    if (!req.body.rolesAllowedToFinishRequest) {
        req.body.rolesAllowedToFinishRequest = [];
    } else {
        if (req.body.rolesAllowedToFinishRequest.constructor !== Array) {
            req.body.rolesAllowedToFinishRequest = [req.body.rolesAllowedToFinishRequest];
        }
    }
}

