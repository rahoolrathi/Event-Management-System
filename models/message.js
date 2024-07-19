const mongoose=require('mongoose');

const messageSchema=new mongoose.Schema({
  sender:{
    type: Types.ObjectId, ref: "users", required: true
  },
  reciver:{
    type: Types.ObjectId, ref: "users", required: true
  },
  message:{
    type:String,
    require:true
  }
},{
  timestamps:true
});

module.exports=mongoose.model('users',messageSchema);