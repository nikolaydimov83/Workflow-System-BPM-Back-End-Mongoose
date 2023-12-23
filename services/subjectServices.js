const Subject = require("../models/Subject");
const Workflow = require("../models/Workflow");

async function createSubject(subject){
    let subjectName=subject.subjectName;
    let assignedToWorkflow=subject.assignedToWorkflow;
    let result=await Subject.create({subjectName,assignedToWorkflow});
    return result
}

async function editSubjectById(id,subject){
    return await Subject.findByIdAndUpdate(id,subject);
}

async function findWorkflowBySubjectId(subjectId){
    let subject=await Subject.findById(subjectId).populate('assignedToWorkflow');
    return subject.assignedToWorkflow
}

async function findAllSubjectsByRole(role){
    let allWorkflows=await Workflow.find({}).populate('initialStatus');
    let workflows=allWorkflows.filter((workflow)=>workflow.initialStatus.statusType.toString()==role.toString());
    let result=new Set()

    for (const workflow of workflows) {
        let subjects=await Subject.find({assignedToWorkflow:workflow.id})
        subjects.forEach((subject)=>{
            result.add(subject)
        })
    }

    return Array.from(result)//await Subject.find({canBeInitiatedByRole:role})
}

async function getAllSubjects(){
        return Subject.find({}).populate('assignedToWorkflow');
}

async function getSubjectById(id){
    return Subject.findById(id)
}

module.exports={createSubject, 
                editSubjectById,
                findWorkflowBySubjectId,
                findAllSubjectsByRole,
                getAllSubjects,
                getSubjectById
            }