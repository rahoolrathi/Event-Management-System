const { boolean } = require('joi');
const mongoose=require('mongoose');

const messageSchema=new mongoose.Schema({
  sender:{
    type: mongoose.Schema.Types.ObjectId, ref: "users", required: true
  },
  reciver:{
    type:mongoose.Schema.Types.ObjectId, ref: "users", required: true
  },
  message:{
    type:String,
    require:true
  },
  isRead:{
    type:Boolean,
    default:false
  },
  channel:{
    type:String,required:true
},
},{
  timestamps:true
});

module.exports=mongoose.model('messages',messageSchema);