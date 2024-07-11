const Event= require('../models/events.js')
const { validateEventDetails } = require('../utils/helper.js');



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
        console.log(req.id)
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
//3complete event
//4 edit event
//5 delete event

module.exports={
    createEvent,
    

}