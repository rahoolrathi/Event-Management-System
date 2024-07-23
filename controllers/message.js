const messageSchema=require('../models/message.js');
const {sendMessageIO,seenMessageIO,notificationCount}=require('../socket.js');
const userSchema=require('../models/users.js')
const requestSchema=require('../models/request.js');
const blockedusersSchema=require('../models/blockedusers.js');
const {emailValidator,validateMessage}=require('../validations/userValidations.js');
const chatlist=require('../models/chat.js');
const { media } = require('../utils/multer');
const message = require('../models/message.js');
const users = require('../models/users.js');


const sendMessage = async (req, res) => {
  try {
    let { receiver, message } = req.body;
    console.log(receiver)
    const sender = req.user.id;

      //console.log(req.file.originalname);
    const { isInvalidEmail } = emailValidator.validate(receiver);
    if (isInvalidEmail) {
      return res.status(422).json({
        status: 'fail',
        message: 'Invalid email format.'
      });
    }
     
    receiver=await userSchema.findOne({email:receiver})
   
    const isFriendsOrBlocked = await requestSchema.findOne({
      $or: [
        { requester: sender, recipient: receiver._id },
        { requester: receiver._id, recipient: sender }
      ]
    }) || await blockedusersSchema.findOne({
      $or: [
        { from: sender, to: receiver._id },
        { from: receiver._id, to: sender }
      ]
    });

    if (!isFriendsOrBlocked || isFriendsOrBlocked.status === 'rejected') {
      return res.status(200).json({ message: "They are not friends or one of them is blocked." });
    }

  
    const { error } = validateMessage.validate({message});
    if (error) {
      return res.status(422).json({
        status: 'fail',
        message: error.details[0].message
      });
    }
      console.log(chatlist)
    const ischannel=await chatlist.findOne({
      '$or':[{
           channel:`${sender}-${receiver._id}`
      },{
          channel:`${receiver._id}-${sender}`
      }]
    });
    let channel;
    if(!ischannel?.channel){
      channel = `${sender}-${receiver._id}`;
       await chatlist.create({
        participants: [sender, receiver._id],
        channel:channel,
        last_message:null,
    });
    }else{
      channel=ischannel.channel;
    }
    const newmessage=await messageSchema.create({
      sender: sender,
      reciver: receiver._id,
      message: message,
      channel:channel
    });
    await chatlist.updateOne(
      { channel: channel },
      { $set: { last_message: newmessage._id } }
    );

    sendMessageIO(receiver._id, message);
    res.status(200).json({ status: 'success', message: 'Message sent successfully.' });
  } catch (error) {
    
    console.error('Error in sendMessage:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};



const deletemessage = async (req, res) => {
  try {
    const messageId = req.params.messageid; 
    const sender = req.user.id;
    if (!messageId) {
      return res.status(400).json({ status: 'fail', message: 'Message ID is required.' });
    }
    await messageSchema.findByIdAndDelete(messageId);
    //notify user to message deleted
    res.status(200).json({ status: 'success', message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error in deletemessage:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

module.exports = deletemessage;



const seenMessage = async (req, res) => {
  try {
    
    let { receiver } = req.params;
    const { isInvalidEmail } = emailValidator.validate(receiver);
    if (isInvalidEmail) {
      return res.status(422).json({
        status: 'fail',
        message: 'Invalid email format.'
      });
    }
     receiver=await userSchema.findOne({email:receiver});
    const sender = req.user.id;

   
    const unseenMessages = await messageSchema.find({
      $or: [
        { channel: `${sender}-${receiver._id}`,  },
        { channel: `${receiver._id}-${sender}`,  }
      ],
      isRead:false
    });

    if (unseenMessages.length > 0) {
      for (const message of unseenMessages) {
        await messageSchema.findByIdAndUpdate(message._id, { $set: { isRead: true } });
        seenMessageIO(message); //notfyin user message is seen
      }
    }
    else{
      res.status(200).json({
        status: 'success',
        message: 'No message found!'
      });
    }

   
    return res.status(200).json({
      status: 'success',
      message: `${unseenMessages.length } Messages marked as read.`
    });
  } catch (error) {
    console.error('Error in seenMessage:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
};


  //count kerna hn jitna bhi isread tr
const unseenMessagecount=async(req,res)=>{

  try {
    
    let { receiver } = req.params;
    const { isInvalidEmail } = emailValidator.validate(receiver);
    if (isInvalidEmail) {
      return res.status(422).json({
        status: 'fail',
        message: 'Invalid email format.'
      });
    }
    receiver=await userSchema.findOne({email:receiver});
    const sender = req.user.id;

   
    const unseenMessages = await messageSchema.find({
      $or: [
        { channel: `${sender}-${receiver._id}`,  },
        { channel: `${receiver._id}-${sender}`,  }
      ],
      isRead:false
    });

    return res.status(200).json({
      status: 'success',
      count:unseenMessages.length
    });
  } catch (error) {
    console.error('Error in seenMessage:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
}


const unreadcountchannels=async(req,res)=>{
  try {  
    const unreadcount = await chatlist.find({
      isRead:false});
      notificationCount(req.user.id,unreadcount.length);
    return res.status(200).json({
      status: 'success',
      count:unreadcount.length
    });
    
  } catch (error) {
    console.error('Error in counting:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
}
module.exports={
  sendMessage,
  deletemessage,
  seenMessage,
  unseenMessagecount,unreadcountchannels


}