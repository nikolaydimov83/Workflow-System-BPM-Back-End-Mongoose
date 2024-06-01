const { serverSendMail, emailAdress, emailSubjectForNewcomment, prepareMailContent } = require('../emailClient/mail');
const { createMailList } = require('../emailClient/mailListCreators');
const { addCommentToRequest } = require('../services/requestServices');
const { parseError } = require('../utils/utils');

const commentsController=require('express').Router();

commentsController.post('/:id',async (req,res)=>{
    let user=req.user;
    try {
        const requestId=req.params.id
        let commentText=req.body.commentText;
        const response=await addCommentToRequest(requestId,commentText,req.user);
        let emailContent=prepareMailContent(response)
        let userListForEmail=await createMailList(response,user)
        userListForEmail.forEach((user)=>{
            serverSendMail(emailAdress,user.email,emailSubjectForNewcomment,emailContent)
        })        
        res.status(201);
        res.json({response});
    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

})
//
module.exports=commentsController;