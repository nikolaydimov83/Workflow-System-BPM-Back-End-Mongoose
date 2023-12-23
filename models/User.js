const { Schema, model,Types } = require("mongoose");

const UserActiveDir = require("./UserActiveDir");
const Role = require("./Role");
let rolesMap={1:'Admin',101:'LA', 102:'LA-ML', 103:'Workflow'}

async function getId(email){

    //let email=this.email;
    let user= await UserActiveDir.findOne({email:email}).populate('role')
    //console.log(userId.id)
    return user
}

const userSchema=new Schema({
    email:{type:String,unique:true,required:true, validate:{
        validator:async (value)=>{
            let result=await UserActiveDir.findOne({email:value})
            return result
        },
        message:(props)=>{return `${props.value} is not found in the active directory!` }
    }},
    hashedPass:{type:String,required:true},
    userStaticInfo:{type:Types.ObjectId,ref:'UserActiveDir'},
    role:{type:String},
    finCenter:{type:Number,min:1,max:999},
    userStatus:{type:String}
 
});

userSchema.pre('save', async function() {
    
    let email=this.email
    let user=await getId(email);

    if (user) {
        
        this.userStaticInfo = user.id;
        this.userStatus=user.userStatus;
        this.finCenter=user.branchNumber;
        this.role=user.role.role;
       
      }else{
          this.userStatus='Inactive';
          throw new Error('User Inactive!!!!')
      }
    });
    /*if (user) {
      this.userStaticInfo = user.id;
      this.userStatus=user.userStatus;
      this.finCenter=user.branchNumber;
      if (user.branchNumber==1){
        this.role='Admin'
        
      }else{
        this.role=user.branchNumber==101?'LA':'Branch'
        
      }
     
    }else{
        this.userStatus='Inactive';
        throw new Error('User Inactive!!!!')
    }
  });*/

userSchema.index({email:1},{
    collation:{
        locale:'en',
        strength:2
    }
});





const User=model('User', userSchema);

module.exports=User;