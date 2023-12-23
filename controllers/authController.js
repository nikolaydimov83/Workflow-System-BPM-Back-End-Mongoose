const { body } = require('express-validator');
const { register, login, createResetPassToken, verifyToken, changePassword } = require('../services/userServices');
const { parseError } = require('../utils/utils');
const {serverSendMail, emailAdress}=require('../emailClient/mail');
const InvalidToken = require('../models/InvalidToken');
const passwordLength=3;


const authController=require('express').Router();

authController.post('/register',
                body('password').isLength(passwordLength).withMessage(`Password must be at least ${passwordLength} chars long`),
                async (req,res)=>{
    try {
        
        let user=await register(req.body.email,req.body.password);
        res.status(202);
        res.json(user);

    } catch (error) {
        res.status(400);
        res.json({message:parseError(error)});
    }
    

    ;
})

authController.post('/login',
                body('password').isLength(passwordLength).withMessage(`Password must be at least ${passwordLength} chars long`),
                async(req,res)=>{
    try {
        
        let user=await login(req.body.email,req.body.password);
        
        res.status(202);
        res.json(user);
    } catch (error) {
        
        res.status(403)
        res.json({message:parseError(error)});
    }
})

authController.get('/logout',async(req,res)=>{
    try {
        const token=req.headers['x-authorization'];
        await InvalidToken.create({token:token});
        res.status(201);
        res.json({message:'Success!'});
    } catch (error) {
        res.status(403)
        res.json({message:parseError(error)});
    }
});

authController.post('/resetPass',async (req,res)=>{
    try {
        
        let user=await createResetPassToken(req.body.email);
        /*const mailOptions = {
            from: 'hello@example.com',
            to: user.email,
            subject: 'Subject',
            text: user.resetToken
            //html: `<a href="http://localhost:3002/users/resetPass/${user.resetToken}">Click here to set new password</a>`
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                throw error
            } else {
                res.status(202);
                res.json({message:'Email with token for password reset sent. Check your mail:' + user.email,_id:user._id});
                console.log('Email sent: ' + info.response);
              // do something useful
            }
          });*/
    const messageForEmail='Use this token to reset your password: '+ user.resetToken
    serverSendMail(emailAdress,user.email,'Reset token',messageForEmail)
    res.status(201);
    res.json(user)
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
    

    ;
})

/*authController.get('/resetPass/:token',async (req,res)=>{
    try {
        
        console.log()


    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
    

    
})*/

authController.post('/resetPass/:id',async (req,res)=>{
    try {
        let token=req.body.resetCode;
        let userFromRequest=await verifyToken(req,res,token);
        if(userFromRequest=='Invalid Token'||userFromRequest=='No user'){
            throw new Error('Invalid token');
        }
        let returnedUser=await changePassword(userFromRequest,req.body.password);
        await InvalidToken.create({token:token});
        res.status(202);
        res.json(returnedUser);

        
        
    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }
    

    
})



module.exports=authController;