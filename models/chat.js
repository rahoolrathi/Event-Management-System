const mongoose=require('mongoose');
const {getMongooseAggregatePaginatedData}=require('../utils/helper.js')
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

module.exports=mongoose.model('chatlist',chatSchema);

//functions 

exports.findChats = async ({ query, page, limit, populate }) => {
    const { data, pagination } = await getMongooseAggregatePaginatedData({
        model: chatlist,
        query,
        page,
        limit,
        populate,
        sort: { updatedAt: -1 }

    });

    return { result: data, pagination };
}
