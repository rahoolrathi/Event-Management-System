const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    name: { type: String, required: true,unique:true },
    datetime: { type: Date, required: true },
    description: { type: String },
    location: { type: String, required: true },
    organizer: { type: mongoose.Types.ObjectId, ref: 'users', required: true },
    attendees: [{ type: mongoose.Types.ObjectId, ref: 'users' }],
    status: { type: String, default: 'upcoming' }

})
module.exports=mongoose.model('events',EventSchema);

