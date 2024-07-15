const mongoose = require('mongoose');

const requestSchema=new mongoose.Schema({
    requester:{
        type:mongoose.Schema.Types.ObjectId,ref:'users',required:true
    },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
})

module.exports=mongoose.model('Request', requestSchema);