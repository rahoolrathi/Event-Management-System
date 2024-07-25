
const mongoose=require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

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
 media:[{
  type:String,
 }],
 deltedby:{
  type:mongoose.Schema.Types.ObjectId,ref:"users",default:null
 },
 deletedforall:{
  type:Boolean,default:false,default:null
 },
 flaggedby:{
  type:mongoose.Schema.Types.ObjectId,ref:"users",default:null
 }, isDeletedForEveryone: { type: Boolean, default: false },
 addreaction:{
  type:String,
  default:null
 }
},{
  timestamps:true
});

messageSchema.plugin(mongoosePaginate);
messageSchema.plugin(aggregatePaginate);
module.exports=mongoose.model('messages',messageSchema);

//Methods

