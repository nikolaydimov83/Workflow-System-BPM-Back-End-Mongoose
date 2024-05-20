const { pageLength } = require("../constants");
const User = require("../models/User");
const UserActiveDir = require("../models/UserActiveDir")



async function createUser(user){
    let result=UserActiveDir.create(user);
    return result
}

async function createUsers(userList){
const result=[]
for (const key in userList) {
    const user = userList[key];
    try {
        await createUser(user)
        user.status='Created'
        user.message='Success!'
        result.push(user)         
    } catch (error) {
        user.status='Not Created'
        user.message=error.message
        result.push(user)
        
    } finally{
        continue
    }


    }
    if (result.length===0){
        console.log()
    }
    return result
}

async function editUsers(userList){
    const result=[]
    for (const key in userList) {
        const user = userList[key];
        try {
            const oldUser=(await UserActiveDir.find({email:user.email}))[0]
            await editUserById(oldUser._id,user)
            user.status='Edited'
            user.message='Success!'
            result.push(user)         
        } catch (error) {
            user.status='Not Edited'
            user.message=error.message
            result.push(user)
            
        } finally{
            continue
        }
    
    
        }
        return result
    }

async function getAllActiveDirUsers(page){
    let query = UserActiveDir.find({});
    if (page){
        query.skip(10*(page-1)).limit(pageLength)
    }
    const result = await query.exec();
    const collectionLength=await UserActiveDir.countDocuments();
    return {result,collectionLength}
}

async function getActiveDirUserByID(id){
    let result = await UserActiveDir.findById(id);
    return result
}

async function editUserById(id,newUser){
    let user=await UserActiveDir.findByIdAndUpdate(id,newUser)

    let userFromUsers=await User.findOne({email:newUser.email});
    await user.save();
    if (userFromUsers){
        await userFromUsers.save();
    }
       
}
async function getUserByEmail(email){
    let user=await UserActiveDir.findOne({email:email});
    return user
}
async function editAllUsersWithRole(role){
    let users=await UserActiveDir.find({role:role});
    let updatedUsers=users.forEach(async (user)=>{
        user.role=role;
        let userFromUsers=await User.findOne({email:user.email});
    await user.save();
    if (userFromUsers){
        await userFromUsers.save();
    }
    })

    return updatedUsers
       
}

module.exports={getAllActiveDirUsers,
                getActiveDirUserByID,
                getUserByEmail,
                editUserById,
                createUser,
                createUsers,
                editUsers,
                editAllUsersWithRole
            }