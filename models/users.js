const mongoose=require('mongoose');
const usersSchema=new mongoose.Schema({
    firstname:{
        type:String,
        required:[true,'A user must have a first name']
    },
    lastname:{
        type:String
    },
    profileImage:{
        type:String
    },
    email:{
        type:String,
        required:[true,'A user must have a email']

    },
    password:{
        type:String,
        required:[true,'A user must have a password']
    }

})

module.exports=mongoose.model('users',usersSchema);