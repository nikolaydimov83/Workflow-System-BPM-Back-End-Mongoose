const { Result } = require("express-validator");
const Request = require("../models/Request");
const Role = require("../models/Role");
const Status=require('../models/Status');
const Subject = require("../models/Subject");
const Workflow = require("../models/Workflow");
const { sortWithType, escapeRegExp } = require("../utils/utils");
const { getActiveDirUserByID } = require("./adminServices");
const { createCommnet } = require("./commentServices");
const { checkUserRoleIsPriviliged } = require("./workflowServices");
const { getStatusById } = require("./statusServices");
const pageLength=require('../constants').pageLength;

async function createRequest(requestObject){
    return await (await Request.create(requestObject)).populate('status');
}

async function getAllUserPendingRequests(user, page){
    let userFinCenter=user.finCenter;
    let userRole=user.role;
    
    let activeDirUser=await getActiveDirUserByID(user.userStaticInfo.toString());
    let activeDirUserRoleId=activeDirUser.role;
    
    const allStatusesRelatedToUserRole=await Status.find({statusType:activeDirUserRoleId})
    let searchContextString='Заявки за изпълнение';
    let query=Request.find({})
        .where('status').in(allStatusesRelatedToUserRole)
        .sort({deadlineDate:1})
    if((userRole.includes('Branch'))){ 
        query.or([{finCenter:userFinCenter},{refferingFinCenter:userFinCenter}])
    }
    const countQuery=query.clone()
    const collectionLength=await countQuery.countDocuments();

    if (page){
        query.skip((page-1)*pageLength).limit(pageLength)
    }
    let result = await query.populate('status requestWorkflow subjectId comments').lean();

    return {result,searchContextString,collectionLength}

}
async function getAllActiveReqs(user,page){
    let userFinCenter=user.finCenter;
    let userRole=user.role;
    let contextAddition=userFinCenter>=111?` за клон ${userFinCenter}`:''
    let searchContextString='Всички активни заявки'+contextAddition;
    let closedRole=await Role.findOne({role:'Closed'});
    const allRelevantStatuses=await Status.find({}).where('statusType').ne(closedRole.id);

        let allRelevantWorkflows=await getRelevantWorkflowsByUsrRole(userRole);
        const query = Request.find({})
        .where('status').in(allRelevantStatuses)
        .where('requestWorkflow').in(allRelevantWorkflows)
        .sort({deadlineDate:1})

        if((userRole.includes('Branch'))){ 
            query.or([{finCenter:userFinCenter},{refferingFinCenter:userFinCenter}])
        }
        const countQuery=query.clone()
        const collectionLength=await countQuery.countDocuments();
        if (page){
            query.skip((page-1)*pageLength).limit(pageLength)
        }
        const result = await query.populate('status requestWorkflow subjectId comments').lean();
        return {result,searchContextString, collectionLength}

    
}

async function getAllReqs(user, page){
    let userFinCenter=user.finCenter;
    let userRole=user.role;
    let contextAddition=userFinCenter>=111?` за клон ${userFinCenter}`:''
    let searchContextString='Всички заявки - активни и неактивни'+contextAddition;
    let query=Request.find({}).sort({deadlineDate:1})

    if((userRole.includes('Branch'))){ 
        query.or([{finCenter:userFinCenter},{refferingFinCenter:userFinCenter}])
    }
    const countQuery=query.clone()
    const collectionLength=await countQuery.countDocuments();
    if (page){
        query.skip((page-1)*pageLength).limit(pageLength)
    }
    let result = await query.populate('status requestWorkflow subjectId comments').lean();
    return {result,searchContextString,collectionLength}
}
async function getAllPassedDeadlineUsrPndngReqs(user,page){
    let userFinCenter=user.finCenter;
    let userRole=user.role;
    let currentDate = new Date().toISOString();
    let contextAddition=userFinCenter>=111?` за клон ${userFinCenter}`:''
    let searchContextString='Забавени заявки '+contextAddition;
    let closedRole=await Role.findOne({role:'Closed'});
    const allRelevantStatuses=await Status.find({}).where('statusType').ne(closedRole.id);
    let allRelevantWorkflows=await getRelevantWorkflowsByUsrRole(userRole);
    let query = Request.find({})
        .where('status').in(allRelevantStatuses)
        .where('deadlineDate').lte(currentDate)
        .where('requestWorkflow').in(allRelevantWorkflows)
        .sort({deadlineDate:1})
        
    if((userRole.includes('Branch'))){ 
    query.or([{finCenter:userFinCenter},{refferingFinCenter:userFinCenter}])
    }
    const countQuery=query.clone()
    const collectionLength=await countQuery.countDocuments();
    if (page){
            query.skip((page-1)*pageLength).limit(pageLength)
    }
    const result = await query.populate('status requestWorkflow subjectId comments').lean();
    return {result,searchContextString,collectionLength}
}

async function sortTable(data, sortProperty,sortIndex){
    if(!sortProperty){
        sortProperty='statusIncomingDate';
    }
    let type= Request.schema.path(sortProperty).instance
    let result=sortWithType(data,type,sortProperty,sortIndex)
    return result
}

async function getRequestById(id){
    return await Request.findById(id)
        .populate({path:'status',populate: { path: 'nextStatuses' }})
        .populate('requestWorkflow')
        .populate('comments').populate('subjectId').populate({path:'comments',populate: { path: 'commentOwner' }})
        .lean()
}
async function getRequestsByClientEGFN(clientEGFN){
    let result= await Request.find({clientEGFN:clientEGFN})
        .populate({path:'status',populate: { path: 'nextStatuses' }})
        .populate('requestWorkflow')
        .populate('comments').populate('subjectId').populate({path:'comments',populate: { path: 'commentOwner' }})
        .lean()
        result.sort((a,b)=>{
            return ((new Date(b.statusIncomingDate) - new Date(a.statusIncomingDate)));
        })
        let searchContextString='Намерени по Булстат/ЕГН: '+clientEGFN;
        return {result,searchContextString}
}
async function getRequestsBySearchString(searchString,page){
    
    const iApplyRegex=/^[A-Z]{2}[0-9]+$/;
    const EGFNRegex=/^[0-9]{9,10}$/;
    const finCenterRegex=/^[0-9]{1,3}$/;
    const emailRegex=/^[A-Za-z0-9]+@postbank.bg$/
    let searchType;
    let searchContextString;
    let regexSanitizedSearchString=escapeRegExp(searchString);
    if(iApplyRegex.test(searchString)){
        searchType='iApplyId';
        searchContextString='Намерени по iApplyId: '+searchString;
    }else if(EGFNRegex.test(searchString)){
        searchType='clientEGFN';
        searchContextString='Намерени по Булстат/ЕГН: '+searchString;
    }else if(finCenterRegex.test(searchString)){
        searchType='finCenter';
        searchContextString='Намерени по ФЦ/Рефериращ ФЦ: '+searchString;
    }else if(emailRegex.test(searchString)){
        searchType='requestCreatorEmail';
        searchContextString='Намерени по E-mail:'+searchString;
    }else{
        searchType='other';
        searchContextString='Намерено в имена, Статуси и Subject: '+searchString;
    }

    if (searchType=='finCenter'){
        const query=Request.find({})
            .or([{finCenter:searchString},{refferingFinCenter:searchString}])
            .sort({deadlineDate:1})
        const countQuery=query.clone();
        const collectionLength=await countQuery.countDocuments();
        if (page){
            query.skip((page-1)*pageLength).limit(pageLength)
        }
        const result = await query
            .populate('status requestWorkflow subjectId comments').lean();

        return {result,searchContextString,collectionLength}
    }
    if (searchType=='other'){
        let result={}
        
        let statusesLikeSearchString=await Status.find({
            statusName:{$regex:'.*' + regexSanitizedSearchString + '.*',$options:'i'
            }});
        let subjectsLikeSearchString=await Subject.find({
            subjectName:{$regex:'.*' + regexSanitizedSearchString + '.*',$options:'i'}
        })
        let workflowsLikeSearchString=subjectsLikeSearchString.map((subject)=>subject.assignedToWorkflow);
        let requestwithStatusMatchQuery=Request
            .find({})
            .or([
                {status:{$in:statusesLikeSearchString}},
                {requestWorkflow:{$in:workflowsLikeSearchString}},
                {clientName:{$regex:'.*' + regexSanitizedSearchString + '.*',$options:'i'}}
            ])
            .sort({deadlineDate:1})
        const countQuery=requestwithStatusMatchQuery.clone();
        const collectionLength=await countQuery.countDocuments();
        if (page){
            requestwithStatusMatchQuery.skip((page-1)*pageLength).limit(pageLength)
        }
        
            const requestwithStatusMatch=await requestwithStatusMatchQuery
            .populate({path:'status',populate: { path: 'nextStatuses' }})
            .populate('requestWorkflow')
            .populate('comments').populate('subjectId').populate({path:'comments',populate: { path: 'commentOwner' }})
            .lean()
        
            return {result:requestwithStatusMatch,searchContextString,collectionLength}

       
    }
    const query = Request.find({}).where(searchType).equals(searchString).sort({deadlineDate:1})

    const countQuery =query.clone();
    const collectionLength=await countQuery.countDocuments();
    if (page){
        query.skip((page-1)*pageLength).limit(pageLength)
    }
    let result= await query
        .populate({path:'status',populate: { path: 'nextStatuses' }})
        .populate('requestWorkflow')
        .populate('comments').populate('subjectId').populate({path:'comments',populate: { path: 'commentOwner' }})
        .lean()
        
        /*result.sort((a,b)=>{
            return ((new Date(b.statusIncomingDate) - new Date(a.statusIncomingDate)));
        })*/
        return {result,searchContextString,collectionLength}
}
async function editRequestStatus(requestId,newStatusId,email){
    let statusIncomingDate = (new Date());
    const newStatus=await getStatusById(newStatusId);
    let historyEntry = { status:newStatus, incomingDate: statusIncomingDate, statusSender: email };
    let request=await Request.findByIdAndUpdate(requestId,{   
                        $push: { history: historyEntry },
                        $set:{
                            status:newStatusId,
                            statusIncomingDate:statusIncomingDate,
                            statusSender:email}})
                        .populate('status')
                        .populate('comments');
    return request
}

async function changeRequestDeadline(requestId,newData, user){
    let comment=await addCommentToRequest(requestId,newData.newComment,user);


    let request=await Request.findByIdAndUpdate(requestId,{   
            
                        $set:{deadlineDate:newData.newDeadline}
                    })
                        .populate('status')
                        .populate('comments');
    return request
}

async function getRequestHistoryById(requestId){
    let request=await Request 
        .findById(requestId)
        .populate('history.status')
        .populate('history.statusSender')
        .populate('history.incomingDate')
    /*request.history.map((entry)=>{
        entry.incomingDate=entry.incomingDate.toISOString()
    })*/
    return request.history
}
async function getUserRights(databaseRequest, user,newStatusId) {
    let activeDirUser=await getActiveDirUserByID(user.userStaticInfo.toString());
    if (await checkUserRoleIsPriviliged(databaseRequest.requestWorkflow._id,user)){
        return {userCanChangeStatus:true, userPrivileged:true}
    }

    if(newStatusId){

        if ((databaseRequest.status.nextStatuses.filter((s) => s._id == newStatusId)).length == 0) {
            return {userCanChangeStatus:false, userPrivileged:false}
    }

    }

    if (databaseRequest.status.statusType.toString() != activeDirUser.role.toString()) {
        return {userCanChangeStatus:false, userPrivileged:false}
    }

    if (user.role.includes('Branch')) {
        if (user.finCenter != databaseRequest.finCenter && user.finCenter != databaseRequest.refferingFinCenter) {
            return {userCanChangeStatus:false, userPrivileged:false}
        }

    }

    return {userCanChangeStatus:true, userPrivileged:false}

}

async function addCommentToRequest(requestId,commentText,user){
    let commnet=await createCommnet(commentText,user);
    let request=await Request.findByIdAndUpdate(requestId,{ 
                        $push: { comments: commnet.id } })
                        .populate('status')
                        .populate('comments')
    return request

}

async function getRelevantWorkflowsByUsrRole(userRole){
    let role=await Role.findOne({role:userRole})
    const statusesInTheWorkflow=await Status.find({}).where('statusType').equals(role);
    const allRelevantWorkflows=await Workflow.find({}).where('allowedStatuses').in(statusesInTheWorkflow)
    return allRelevantWorkflows
}

async function getRequestsByIApplyId(iApplyId){
    return await Request.find({iApplyId:iApplyId})

}
module.exports={
                    createRequest,
                    getAllUserPendingRequests,
                    getAllPassedDeadlineUsrPndngReqs,
                    sortTable,
                    getRequestById,
                    editRequestStatus,
                    changeRequestDeadline,
                    getUserRights,
                    addCommentToRequest,
                    getRequestsByClientEGFN,
                    getRequestsBySearchString,
                    getAllActiveReqs,
                    getAllReqs,
                    getRequestHistoryById,
                    getRequestsByIApplyId
                }