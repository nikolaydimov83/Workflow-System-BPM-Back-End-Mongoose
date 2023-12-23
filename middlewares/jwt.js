
const { verifyToken } = require('../services/userServices');
const { parseError } = require('../utils/utils');

const guestAllowedAdresses=['login','register','resetPass'];
module.exports=()=>async (req,res,next)=>{
emailToLowerCase(req);
    const result=await verifyToken(req,res);
    const requestType=req.originalUrl.split('/')[2];
    const isAdmin=req.originalUrl.split('/')[1]=='admin'?true:false;
    const isWorkflow=req.originalUrl.split('/')[1]=='workflow'?true:false;
    try {
    if(result!=='No user'&&result!=='Invalid token'){
        req.user=result;
        req.user.isGuest=false;
        if (isAdmin&&result.role!="Admin"){
            throw new Error('You are not admin!');
        }
        if (isWorkflow&&result.role!="Workflow"){
            if(req.method=='GET'&&req.originalUrl=='/workflow/roles'&&result.role=='Admin'){

            }else{
                throw new Error('You are not Workflow Designer!');
            }
            
        }

        if (guestAllowedAdresses.includes(requestType)&&requestType!='resetPass'){
            throw new Error('You are already logged!');
        }

    }else{

        if(!guestAllowedAdresses.includes(requestType)){
           throw new Error('You are not logged! Please login in order to proceed');
        }

        req.user={isGuest:true}
    }
   
    next();

    } catch (error) {
        res.status(401);
        res.json({message:parseError(error)});
    }

}

function emailToLowerCase(req){
    if (req.body){
        if (req.body.email){
            req.body.email=req.body.email.toLowerCase();
        }
    }
}