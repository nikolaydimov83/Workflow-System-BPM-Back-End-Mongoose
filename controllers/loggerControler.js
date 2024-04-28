const UserActiveDir = require('../models/UserActiveDir');
const { getAllActiveDirUsers, getActiveDirUserByID, editUserById, createUser } = require('../services/adminServices');
const { getAllIApplyDataWrong } = require('../services/logServices');
const { getAllRoles } = require('../services/workflowServices');
const { parseError } = require('../utils/utils');


const loggerController=require('express').Router();

loggerController.get('/',async(req,res)=>{
    try {
        let data=await getAllIApplyDataWrong()
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});



module.exports=loggerController;


