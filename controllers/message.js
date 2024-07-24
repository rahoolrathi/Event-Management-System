const messageSchema=require('../models/message.js');
const {sendMessageIO,seenMessageIO,notificationCount,EditMessageIO,resetChatIO}=require('../socket.js');
const userSchema=require('../models/users.js')
const requestSchema=require('../models/request.js');
const blockedusersSchema=require('../models/blockedusers.js');
const {emailValidator,validateMessage}=require('../validations/userValidations.js');
const chatlist=require('../models/chat.js');
const {parsebody}=require('../utils/helper.js');
const { media } = require('../utils/multer');
const message = require('../models/message.js');
const users = require('../models/users.js');
const {sendMessageValidations}=require('../validations/messageValidtions.js');
const { getChatListQuery } = require('../query/message.js');
const {findChats}=require('../models/chat.js');
const {getMongoosePaginatedData}=require('../utils/helper.js')

const sendMessage = async (req, res) => {
  try {
    //Step 1 parsing body
    let { receiver,parent, message } = parsebody(req.body);
    const sender=req.user.id;
    //step 2 validating body
    const {error}=sendMessageValidations.validate(req.body);
    if (error) {
      return res.status(422).json({
        status: 'fail',
        message: error.details[0].message
      });
    }
   
   //step 3 checking if they are friends or not
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

    //step4 checking channel is exist or not

    const ischannel=await chatlist.findOne({
      '$or':[{
           channel:`${sender}-${receiver}`
      },{
          channel:`${receiver}-${sender}`
      }]
    });

    //step 5
    /*
    let suppose if one user deleted channel but not both then we have to restore channel again when sender
    or receiver send message eachother  this is possible only if channel is exist

    logic
    we are first finding channel  by id and then unset means removing that failed from that channel
    */
    if(ischannel){
      if(ischannel.deletedby){
        await chatlist.updateOne({_id:ischannel._id},{
          '$unset':{deletedBy:ischannel.deletedBy}
        })
      }
    }  
    //step 6 if channel not exit then we are creating channel and asssigning in channel if exist then simple assigning
    let channel;
    if(!ischannel){
      channel = `${sender}-${receiver}`;
       await chatlist.create({
        participants: [sender, receiver],
        channel:channel,
    });
    }else{
      channel=ischannel.channel;
    }
    //steps 7 creating new message object
    const messageData={receiver,sender,channel};
    //creating array if user send any document or something
    let media=[];
    if(req.files?.media.length>0){
      req.files?.media.forEach((file)=>media.push(`messages/${file?.filename}`));
    }
   messageData.push(media);
   //checking it is reply of any message or direct message
   if(parent){
    message.parent=parent;
   }
   else{
    messageData.message=message;
   }

    let newmessage=await messageSchema.create(messageData);

    //step 8 update last message in chatlist

    await chatlist.updateOne(
      { channel: channel },
      { $set: { last_message: newmessage._id } }
    );
    //step 9 now we have reset chatlist of sender and receiver 
    let resetchatsender=await ResetchatList(sender);
    let resetchatreceiver=await ResetchatList(receiver);
    //step 10 real time emiting of resetchat objects
    resetChatIO(sender,resetchatsender);
    resetChatIO(receiver,resetchatreceiver);
    //step 11 populates messsage object object all fields lke from message populate sender,sender images,otjer
    newmessage=await messageSchema.findById(newmessage.id).populate({
      path:'sender',populate:{path:'ssn_image profileImage'}}).populate('parent');

      //step 14 we have to calculate count of unseenMessage
      //step 15 we have to calculate unseenmessagechannels count
      //step 16 send updated unseenMessage and unseenMessage channel count in to real time


    //step 17 real time emiting message object
    sendMessageIO(receiver._id, newmessage);
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


//when user gets message means  (seen all messages))
const getMessage = async (req, res) => {
  try {
    
    let { receiver } = req.params;
    const sender = req.user.id;

     const query={
      $or: [
        { channel: `${sender}-${receiver}`,  },
        { channel: `${receiver}-${sender}`,  }
      ],
      isRead:false,
      sender: receiver,
      deletedBy: { $ne: sender }, 
      flaggedBy: { $ne: sender }

    }
    const unseenMessages = await messageSchema.find(query);

    if (unseenMessages.length > 0) {
      for (const message of unseenMessages) {
        await messageSchema.findByIdAndUpdate(message._id, { $set: { isRead: true } });
        seenMessageIO(message); //notfyin user message is seen
      }
      //resetting chats
      let resetChatssender = await ResetchatList(sender)
      let resetChatsReciever = await ResetchatList(receiver)       
      resetChatIO( sender, resetChatssender)
      resetChatIO( receiver, resetChatsReciever)
    }
    //now we are adding limits for optimise purpose how message to display on screen we will only fetch that message on fronted
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    //now we have adding limits for optimise purpose 
    const populate=[{path: 'sender',populate: {path: 'ssn_image profileImage',},},]

    let messagesData =async ({ query, page, limit, populate }) => {
      const { result, pagination } = await getMongoosePaginatedData({
        model: messageSchema,
        query,
        page,
        limit,
        populate
      });
      return { result: data, pagination };
    } 
    
    
  
   

    return res.status(200).json({
      status: 'success',
      message: `${messagesData } Messages fetched sucessfuly......`
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

const editMessage=async(req,res)=>{
    try {
      let { messageid, message } = req.body;

      const { error } = validateMessage.validate({message});
      if (error) {
        return res.status(422).json({
          status: 'fail',
          message: error.details[0].message
        });
      }
        
     const newmessage=await messageSchema.findByIdAndUpdate(messageid,{message:message, isEdited:true});
      EditMessageIO(newmessage);
      res.status(200).json({ status: 'success', message: 'Message Edited successfully.' });
    } catch (error) {
      
      console.error('Error in sendMessage:', error);
      res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  };
const ResetchatList=async (userid)=>{
  const query=getChatListQuery(userid);
  const page=1;
  const limit=100;
  const populate= [{path: 'sender',populate: {path: 'ssn_image profileImage',},},]
  try {
    const chats = await findChats({ query, page, limit,populate});
      return chats
} catch (error) {
    next(new Error(error.message));
}



}
module.exports={
  sendMessage,
  deletemessage,
  getMessage,
  unseenMessagecount,unreadcountchannels,
  editMessage


}