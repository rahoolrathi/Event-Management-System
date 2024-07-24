const { boolean, required } = require('joi');
const mongoose=require('mongoose');
const { default: isBoolean } = require('validator/lib/isBoolean');

const messageSchema=new mongoose.Schema({
  sender:{
    type: mongoose.Schema.Types.ObjectId, ref: "users", required: true
  },
  receiver:{
    type:mongoose.Schema.Types.ObjectId, ref: "users", required: true
  },
  message:{
    type:String,
    require:false,
    default:null
  },
  parent:{
    type:mongoose.Schema.Types.ObjectId,ref:"messages",required:false,default:false
  },
  isRead:{
    type:Boolean,
    default:false
  },
  isEdited:{
    type:Boolean,
    default:false
  },
  channel:{
    type:String,required:true
},
 media:{
  type:String,
 },
 deltedby:{
  type:mongoose.Schema.Types.ObjectId,ref:"users",default:null
 },
 deletedforall:{
  type:isBoolean,default:false,default:null
 },
 flaggedby:{
  type:mongoose.Schema.Types.ObjectId,ref:"users",default:null
 }
},{
  timestamps:true
});

module.exports=mongoose.model('messages',messageSchema);