const Event= require('../models/events.js')
const { validateEventDetails } = require('../utils/helper.js');
const User=require('../models/users.js');
const Request=require('../models/request.js');
const {addEventToRedis,getEventFromRedis}=require('../queue.js');

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
        //console.log(req.user.id)
        const newevent=await Event.create({
            name,
            datetime,
            description,
            location,
            organizer: req.user.id
        });
      await addEventToRedis(newevent);
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
    //console.log(req.params);
    const eventname=req.params.eventName;
   
    const  event=await Event.findOne({name:eventname});
   // console.log(event.attendees)
    if(!event){
        return res.status(404).json({
            status: "error",
            error: "Event not found.",
        });
    }
    //console.log(req.user.id)
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
    //  console.log(event)
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
        //console.log(req.user.id); // Assuming req.user.id is used for organizer ID

        const updatedEvent = await Event.findByIdAndUpdate(id, {
            name,
            datetime,
            description,
            location,
            organizer: req.user.id
        }, { new: true });

          await addEventToRedis(updatedEvent);
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
      const eventName = req.params.eventName;
         
      const cachedEvent = await getEventFromRedis(eventName);
      if (cachedEvent) {
          return res.status(200).json({
              status: 'success',
              data: cachedEvent,
          });
      }
      const event = await Event.findOne({ name: eventName }).populate('attendees');
      if (!event) {
          return res.status(404).json({
              status: 'error',
              error: 'Event not found.',
          });
      }
      await addEventToRedis(event);
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

const minEvents=async(req,res)=>{
    const {n}=req.params.n;
    try{
       const events=await Event.aggregate([{
        $match:{
            $expr:{$gte:[{}]}
        }
       }])
    }catch(error){

    }
}




const getEventsWithMinAttendees = async (req, res) => {
  try {
    // Parse the minimum number of attendees from the request parameters
    const minAttendees = parseInt(req.params.minAttendees, 10);

    // Validate the minAttendees parameter
    if (isNaN(minAttendees)) {
      return res.status(400).json({ status: 'error', message: 'Invalid number of attendees' });
    }

    // Build the aggregation pipeline
    const events = await Event.aggregate([
    
      {
        $project: {
          name: 1,
          datetime: 1,
          description: 1,
          location: 1,
          organizer: 1,
          attendees: 1,
          status: 1,
          attendeesCount: { $size: '$attendees' }
        }
      },
      
      {
        $match: {
          attendeesCount: { $gte: minAttendees }
        }
      },
   
      {
        $lookup: {
          from: 'users',
          localField: 'attendees',
          foreignField: '_id',
          as: 'attendeesDetails'
        }
      },
      
      {
        $lookup: {
          from: 'users',
          localField: 'organizer',
          foreignField: '_id',
          as: 'organizerDetails'
        }
      },
    
      {
        $unwind: '$organizerDetails'
      }
    ]);

   
    res.status(200).json({
      status: 'success',
      data: {
        events
      }
    });
  } catch (error) {
   
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      trace: error.message
    });
  }
};

module.exports = {
  getEventsWithMinAttendees
};

const displayAttendees = async (req, res) => {
  try {
    const { recipantemail } = req.params;
     console.log(recipantemail)
    const recipient = await User.findOne({ email: recipantemail });
    if (!recipient) {
      return res.status(404).json({
        status: 'error',
        message: 'Recipient not found'
      });
    }
    const recipantid = recipient._id;

  
    const requesterid = req.user.id;


    const request = await Request.findOne({
      requester: requesterid,
      recipient: recipantid,
      status: "accepted"
    });

    if (!request) {
      return res.status(404).json({
        status: 'error',
        message: 'Accepted request not found'
      });
    }

  
      const event=await Event.findOne({organizer:recipantid}).populate('attendees','firstname lastname email')
      console.log(event)
    res.status(200).json({
      status: 'success',
      message: 'Attendance found',
      data: event.attendees
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error',
      trace: error.message
    });
  }
};

module.exports={
    createEvent,
    joinEvent,
    completeEvent,
  editEvent,
  deleteEvent,
  displayEvents,getEventsWithMinAttendees,
  displayAttendees
}