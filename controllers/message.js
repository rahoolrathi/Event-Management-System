const messageSchema=require('../models/message.js');
const {sendMessageIO}=require('../socket.js');
const userSchema=require('../models/users.js')
const requestSchema=require('../models/request.js');
const blockedusersSchema=require('../models/blockedusers.js');
const {emailValidator,validateMessage}=require('../validations/userValidations.js');
const chatlist=require('../models/chat.js');
const { media } = require('../utils/multer');
const message = require('../models/message.js');


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
        last_message:null
    });
    }else{
      channel=ischannel.channel;
    }
    const newmessage=await messageSchema.create({
      sender: sender,
      reciver: receiver._id,
      message: message
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

    res.status(200).json({ status: 'success', message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error in deletemessage:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};

module.exports = deletemessage;

exports.seenMessage=async(req,res)=>{
  

  //count kerna hn jitna bhi isread true
},
exports.unseenMessage=async(req,res)=>{

  //count kerna hn jitna bhi isread false
}
module.exports={
  sendMessage,
  deletemessage

}