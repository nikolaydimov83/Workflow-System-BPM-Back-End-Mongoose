const { addCommentToRequest } = require('../services/requestServices');
const { parseError } = require('../utils/utils');

const commentsController=require('express').Router();

commentsController.post('/:id',async (req,res)=>{
    try {
        const requestId=req.params.id
        let commentText=req.body.commentText;
        const newComment=await addCommentToRequest(requestId,commentText,req.user);
        res.status(201);
        res.json({newComment});
    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

})
//
module.exports=commentsController;