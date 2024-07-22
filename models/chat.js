const mongoose=require('mongoose');
const chatSchema=new mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId, ref: "users", required: true  
    }],
    channel:{
          type:String,required:true
    },
    last_message:{
        type:mongoose.Schema.Types.ObjectId, ref: "messages"
    }
},{
    timestamps:true
})

module.exports=mongoose.model('chatlist',chatSchema);