const mongoose=require('mongoose');


const blockedUsersSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
});

module.exports = mongoose.model('BlockedUser', blockedUsersSchema);


