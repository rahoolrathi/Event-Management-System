const mongoose=require('mongoose');
const {getMongooseAggregatePaginatedData}=require('../utils/helper.js')
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const chatSchema=new mongoose.Schema({
    participants:[{
        type:mongoose.Schema.Types.ObjectId, ref: "users", required: true  
    }],
    channel:{
          type:String,required:true
    },
    last_message:{
        type:mongoose.Schema.Types.ObjectId, ref: "messages"
    },
    isRead:{
        type:Boolean,
        default:false
      },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
},{
    timestamps:true
})
chatSchema.plugin(mongoosePaginate);
chatSchema.plugin(aggregatePaginate);
const chatlist =mongoose.model('chatlist',chatSchema);


//functions 
const findChats = async ({ query, page, limit, populate }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: chatlist,
        query,
        page,
        limit,
        populate,
        sort: { updatedAt: -1 }
    })
  return { result: data, pagination };
}

module.exports={
    findChats,
    chatlist
}

