const { Schema, model, Types }=require('mongoose');
const NOTIFICATION_TYPE=require('../utils/constants.js');
const receiversSchema = new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "user", required: true },
      isRead: { type: Boolean, default: false },
    },
    { _id: false }
  );
  
const notificationSchema=new moongose.Schema({
 receivers:[receiversSchema],
 sender:{
    type:Types.ObjectId,
    ref:'users',
 },
 title:{
    type:String,default:null
 },
 type:{
    type:String,
    enum:Object.values(NOTIFICATION_TYPE),
    require:true,
 },
 image:{
    type:String,
    default:null,
 }
},
{timestamps:true}
);
module.exports=mongoose.model('notifications',notificationSchema);

