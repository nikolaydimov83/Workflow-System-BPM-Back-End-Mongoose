const User = require("../models/User");

async function createMailList(response,user){
    let userListForEmail=await User.find({})
        .or([{finCenter:response.finCenter},{finCenter:response.refferingFinCenter}])
        .or([{email: response.requestCreatorEmail}])
        .lean();
    userListForEmail=userListForEmail.filter((u)=>u.email!=user.email)
    return userListForEmail
}

module.exports={createMailList};