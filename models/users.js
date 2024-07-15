const mongoose=require('mongoose');
const validator = require('validator');
const usersSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,'Please tell us your name!']
    },
    lastname:{
        type:String
    },
    profileImage:{
        type:String
    },
    email:{
        type:String,
        required:[true,'Please provide your email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'Please provide a valid email']


    },
    password:{
        type:String,
        required:[true,'Please provide a password'],
       
    },
    blockedUsers: [{ type: mongoose.Types.ObjectId, ref: 'users' }]

})

module.exports=mongoose.model('users',usersSchema);