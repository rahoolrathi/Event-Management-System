const mongoose=require('mongoose')

const otpSchema=new mongoose.Schema({

    email:{
        type:String,
        ref:'users'
    },
    otpCode:{
        type:String
    }
},{
    timestamps:true
})

module.exports=mongoose.model('otpCode',otpSchema);