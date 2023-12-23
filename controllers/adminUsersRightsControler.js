const UserActiveDir = require('../models/UserActiveDir');
const { getAllActiveDirUsers, getActiveDirUserByID, editUserById, createUser } = require('../services/adminServices');
const { getAllRoles } = require('../services/workflowServices');
const { parseError } = require('../utils/utils');


const adminUsersRightsControler=require('express').Router();

adminUsersRightsControler.get('/',async(req,res)=>{
    try {
        let data=await getAllActiveDirUsers();
        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }


});

adminUsersRightsControler.post('/',async(req,res)=>{
    try {
        if(await UserActiveDir.findOne({email:req.body.email})){
            throw new Error('User already exists! If you want to change user data - go through edit functionality.')
        }
        let user=await createUser(req.body);
        res.status(201);
        res.json(user);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
   

});

adminUsersRightsControler.get('/:id',async(req,res)=>{
    let id =req.params.id;
    try {
        let data = await getActiveDirUserByID(id);

        res.status(201);
        res.json(data);
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
});

adminUsersRightsControler.put('/:id',async(req,res)=>{
    let id =req.params.id;
    try {
        await editUserById(id, req.body);
        res.status(201);
        res.json(`User successffuly updated!`)
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)})
    }
});

module.exports=adminUsersRightsControler;


