const Event= require('../models/events.js')
const User=require('../models/users.js');
const Request=require('../models/request.js');
const blockedUsers=require('../models/blockedusers.js');
const createRequest = async (req, res) => {
    try {
        const { recipientemail } = req.params;
        
        const recipient = await User.findOne({ email: recipientemail });
        if (!recipient) {
            return res.status(404).json({
                status: 'error',
                message: 'Recipient not found'
            });
        }
         
        const blocked=blockedUsers.findOne({from:req.user.id,to:recipient._id})
        if (blocked) {
            return res.status(403).json({
                status: 'error',
                message: 'You have blocked this Recipient'
            });
        }
        const blockedby=blockedUsers.findOne({from:recipient._id,to:req.user.id})
        if (blockedby) {
            return res.status(403).json({
                status: 'error',
                message: 'The recipient has blocked you.'
            });
        }
        // Proceed with creating the request
        const newRequest = await Request.create({
            requester: req.user.id,
            recipient: recipient._id,
        });

        res.status(201).json({
            status: 'success',
            message: 'Request sent successfully',
            data: newRequest
        }); 
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Unexpected error',
            trace: error.message
        });
    }
};


const acceptRequest = async (req, res) => {
    try {
      const { requestid } = req.params;
      console.log(req.params)
  
      const request = await Request.findByIdAndUpdate(requestid, { status: 'accepted' }, { new: true });
  
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Request accepted',
        data: request
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Unexpected error',
        trace: error.message
      });
    }
  };

  const rejectRequest = async (req, res) => {
    try {
      const { requestid } = req.params;
      console.log(req.params)
  
      const request = await Request.findByIdAndUpdate(requestid, { status: 'rejected' }, { new: true });
  
      if (!request) {
        return res.status(404).json({
          status: 'error',
          message: 'Request not found'
        });
      }
  
      res.status(200).json({
        status: 'success',
        message: 'Request Rejected',
        data: request
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
    createRequest,
    acceptRequest,
    rejectRequest,

}