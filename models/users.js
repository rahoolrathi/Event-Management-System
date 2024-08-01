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
    device_token: { type: String, default: null  },
    ssn_image: {  type:  mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    profileImage: { type:  mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    backgroundImage: { type:  mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    

})

module.exports=mongoose.model('users',usersSchema);