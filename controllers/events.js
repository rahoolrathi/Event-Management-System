const Event= require('../models/events.js')
const { validateEventDetails } = require('../utils/helper.js');
const User=require('../models/users.js');


//1 create Event
const createEvent=async (req,res)=>{
    try {
        const {name,date,time,description,location}=req.body;
        const errors = validateEventDetails({ name, date, time, location });
        if(errors.length>0){
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                trace: errors
            });
        }
        const datetime=new Date(`${date}T${time}`);
        console.log(req.user.id)
        const newevent=await Event.create({
            name,
            datetime,
            description,
            location,
            organizer: req.user.id
        });
        res.status(201).json({
            status: 'success',
            message: "Event Created Sucessfully",
            data: {
                Event:newevent,
                

            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "unexpected error",
            trace: error.message
        });
        
    }
}
//2join Event

const joinEvent=async (req,res)=>{
    
  try {
    console.log(req.params);
    const eventname=req.params.eventName;
   
    const  event=await Event.findOne({name:eventname});
   // console.log(event.attendees)
    if(!event){
        return res.status(404).json({
            status: "error",
            error: "Event not found.",
        });
    }
    console.log(req.user.id)
    if (event.attendees.includes(req.user.id)) {
      return res.status(400).json({ status:'Error' ,error: 'User already registered for this event.' });
    }
   
    event.attendees.push(req.user.id);
    
    
    await event.save();
    
    res.status(200).json({ status:"Success",message: 'Event joined  successfully.' });
  } catch (error) {
    return res.status(500).json({
        status: "error",
        message: "unexpected error",
        trace: error.message
    });
  }
}
//3complete event

const completeEvent=async (req,res)=>{
    try {
      
      const eventname=req.params.eventName;
     
      const event = await Event.findOneAndUpdate({name:eventname}, { status: 'complete' }, { new: true });
      console.log(event)
      if(!event){
          return res.status(404).json({
              status: "error",
              error: "Event not found.",
          });
      }
      res.status(200).json({ status:"Success",message: 'Event Status Updated  successfully.' });
    } catch (error) {
      return res.status(500).json({
          status: "error",
          message: "unexpected error",
          trace: error.message
      });
    }
  }

//4 edit event
const editEvent = async (req, res) => {
   try {
        const  eventname  = req.params.eventName; // Assuming you pass event ID in the URL params for update
       const { name, date, time, description, location } = req.body;

        const errors = validateEventDetails({ name, date, time, location });
        if (errors.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "Validation error",
                trace: errors
            });
        }

        const datetime = new Date(`${date}T${time}`);
        console.log(req.user.id); // Assuming req.user.id is used for organizer ID

        const updatedEvent = await Event.findByIdAndUpdate(id, {
            name,
            datetime,
            description,
            location,
            organizer: req.user.id
        }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found or could not be updated.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Event updated successfully.',
            data: {
                Event: updatedEvent
            }
        });
    } catch (error) {
        console.error('Error updating event:', error);
        return res.status(500).json({
            status: "error",
            message: "Unexpected error occurred.",
            trace: error.message
        });
    }
};

//5 delete event
const deleteEvent = async (req, res) => {
    try {
        const eventname = req.params.eventName;

        
        const event = await Event.findOneAndDelete({ name: eventname });

        if (!event) {
            return res.status(404).json({
                status: "error",
                error: "Event not found.",
            });
        }

        return res.status(200).json({
            status: "success",
            message: 'Event deleted successfully.',
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        return res.status(500).json({
            status: "error",
            message: "Unexpected error occurred.",
            trace: error.message
        });
    }
};


const displayEvents = async (req, res) => {
    try {
        const eventname = req.params.eventName;
        
       
        const event = await Event.findOne({ name: eventname }).populate('attendees');

        if (!event) {
            return res.status(404).json({
                status: 'error',
                error: 'Event not found.',
            });
        }
        res.status(200).json({
            status: 'success',
            data: event,
        });
    } catch (error) {
        console.error('Error displaying event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Unexpected error',
            trace: error.message,
        });
    }
};


module.exports={
    createEvent,
    joinEvent,
    completeEvent,
  editEvent,
  deleteEvent,
  displayEvents
}