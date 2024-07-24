const mongoose = require('mongoose');

const requestSchema=new mongoose.Schema({
    requester:{
        type:mongoose.Schema.Types.ObjectId,ref:'users',required:true
    },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    status: { type: String, enum: ['accepted', 'rejected'], default: 'rejected' }
})

module.exports=mongoose.model('Request', requestSchema);