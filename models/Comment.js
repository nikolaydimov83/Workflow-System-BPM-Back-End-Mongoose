const { Schema, model,Types } = require("mongoose");


const requestCommentSchema=new Schema({
    body:{type:String, required:true},
    commentDate:{type:Date, default:Date.now, immutable:true},
    commentOwner:{type:Types.ObjectId, ref:'User'}
});

requestCommentSchema.index({commentOwner:1},{
    collation:{
        locale:'en',
        strength:2
    }
});


const Comment=model('Comment', requestCommentSchema);

module.exports=Comment;