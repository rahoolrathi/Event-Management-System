const messageSchema=require('../models/message.js');
const {sendMessageIO,seenMessageIO,unSeenMessageCountChannel,addreactionIO,EditMessageIO,resetChatIO,deleteMessageForAllIO,unSeenMessageCount

}=require('../socket.js');

const requestSchema=require('../models/request.js');
const blockedusersSchema=require('../models/blockedusers.js');
const {validateMessage}=require('../validations/userValidations.js');
const chatlist=require('../models/chat.js');
const {parsebody}=require('../utils/helper.js');
const {sendMessageValidations}=require('../validations/messageValidtions.js');
const { getChatListQuery } = require('../query/message.js');
const findChats=require('../models/chat.js');
const {getMongoosePaginatedData}=require('../utils/helper.js')
const MediaModel = require('../models/media.js');
//done
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
        { requester: sender, recipient: receiver },
        { requester: receiver, recipient: sender }
      ]
    }) || await blockedusersSchema.findOne({
      $or: [
        { from: sender, to: receiver },
        { from: receiver, to: sender }
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
    
    //creating array if user send any document or something
    let media=[];
    if(req.files?.media.length>0){
      req.files?.media.forEach((file)=>media.push(`messages/${file?.filename}`));
    }
    const messageData={receiver,sender,channel,media};

   //checking it is reply of any message or direct message
   console.log('----------------');
   if(parent){
    message.parent=parent;
   }
   else{
    messageData.message=message;
   }
   console.log(parent)
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
      console.log("-----------------helo2")
      //step 14 we have to calculate count of unseenMessage
      const receiverCount =  await  messageSchema.countDocuments({receiver,isRead:false})
      //step 15 we have to calculate unseenmessagechannels count
      const unSeenMessageCountByChannel=await messageSchema.countDocuments({receiver,channel,isRead:false})
      //step 16 real time emiting message object
      //console.log(receiver)
      console.log(sendMessageIO(receiver, newmessage));
      //step 17 send updated unseenMessage and unseenMessage channel count in to real time
      unSeenMessageCount(receiver, receiverCount);
      unSeenMessageCountChannel(receiver,unSeenMessageCountByChannel,channel)

   
  
      res.status(200).json({ status: 'success', message: 'Message sent successfully.' });
  } catch (error) {
    
    console.error('Error in sendMessage:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};


//delete message from me done
const deletemessage = async (req, res) => {
  try {
    const {messageId} = req.params; 
    const userId = req.user.id;
    if (!messageId) {
      return res.status(404).json({ status: 'fail', message: 'Message ID is required.' });
    }
    let message=await messageSchema.findById(messageId);
    if(!message){
      return res.status(404).json({ status: 'fail', message: 'Message Not found!' });
    }
    //if already deleted from one user and that is not me
    if(message.deletedBy&&message?.deletedBy.toString() !== userId){
      //then delete it from database 
      //const message =await messageSchema.findByIdAndDelete(messageId);
      //instead of hard delete we are doing soft delete just bt setting isdeleteforeveryone= true
      const message=await await messageSchema.findByIdAndUpdate(messageId, { $set: { isDeletedForEveryone: true } });
      if (!message)
         return res.status(500).json({ status: 'fail', message: 'Message deletion failed!' });
      res.status(200).json({ status: 'success', message: 'Message deleted successfully.' });
    }

    //else lets set deleted by true for that message

    message = await messageSchema.findByIdAndUpdate(messageId, { $set: { deletedBy: userId } });
        if (!message) return next({
            statusCode: 500,
            message: 'Message deletion failed!'
        })
        res.status(200).json({ status: 'success', message: 'Message deleted successfully.' });
  } catch (error) {
    console.error('Error in deletemessage:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
};



//get message done
//when user gets message means  (seen all messages))
const getMessages = async (req, res) => {
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
      isDeletedForEveryone:false,
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
    delete query.isRead;
    delete query.sender;
    //only get messages if message is not deleted for everyone

    //now we are adding limits for optimise purpose how message to display on screen we will only fetch that message on fronted
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    //now we have adding limits for optimise purpose 
    const populate=[{path: 'sender',populate: {path: 'ssn_image profileImage',},},]

      const { data, pagination } = await getMongoosePaginatedData({
        model: messageSchema,
        query,
        page,
        limit,
        populate});
      
    return res.status(200).json({
      status: 'success',
      message: `Messages fetched sucessfuly......`,
      data,
      pagination
    });
  } catch (error) {
    console.error('Error in seenMessage:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }
};


//done

const deletemessageforeveryone=async(req,res)=>{
  const sender=req.user.id;
  const {messageid}=req.params;
  try{
    let message=messageSchema.findById(messageid);
    if(!message){
      return res.status(404).json({ status: 'fail', message: 'Message Not found!' });
    }
    if(message.sender.toString()!=sender){
      return res.status(401).json({ status: 'fail', message: 'Message owner can only delete the message!' });
    }
    //we are soft deleting message may be required backup in future
    message = await messageSchema.findByIdAndUpdate(messageid, { $set: { isDeletedForEveryone: true } });
    deleteMessageForAllIO(message);
    return res.status(200).json({
      status: 'success',
      message: ` Messages Deleted sucessfuly......`
    });
  }catch(error){
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error.'
    });
  }

  


}


  //count kerna hn jitna bhi isread tr



const clearchat=async(req,res)=>{
try{
  const {receiver}=req.params;
  const  sender=req.user.id;
  const Messages=await messageSchema.find({'$or':[
    {channel:`${sender}-${receiver}`},{channel:`${receiver}-${sender}`}
  ]});
  if(Messages.length===0){
    return res.status(404).json({
      status:'fail',
      message:'messages not found!'
    })
  }
  Messages.forEach(async(m)=>{
    if (Types.ObjectId.isValid(m.deletedBy) && m?.deletedBy.toString() !== loginUser) {
      // check if one user has already deleted message, then delete from db
      await messageSchema.findByIdAndUpdate(m?._id,{$set:{isDeletedForEveryone:true}});
  } else {
      // if not deleted earlier from one side, then update deleteBy from loginUser
      await messageSchema.findByIdAndUpdate(m?._id, { $set: { deletedBy: loginUser } });
  }
  });

  return res.status(200).json({
    status: 'success',
    message: ` chat cleared sucessfuly......`
  });
//i think we should have to use socket there 
}catch(error){
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error.'
  });

}


}
const editMessage=async(req,res)=>{
    try {
      //step 1 get message from req.body
      let { messageid, newmessage } = parsebody(req.body);
      const sender=req.user.id;
      //step 2 find message by message id
      let message=messageSchema.findById(messageid);
      if(!message){
        return res.status(404).json({ status: 'fail', message: 'Message Not found!' });
      }
      //step 3 validate new message
      const { error } = validateMessage.validate({newmessage});
      if (error) {
        return res.status(422).json({
          status: 'fail',
          message: error.details[0].message
        });
      }
      //step 4 check only login user could edit self message
      if(message.sender.toString()!=sender){
        return res.status(401).json({ status: 'fail', message: 'Message owner can only edit this message!' });
      }
      const updatedmessage=await messageSchema.findByIdAndUpdate(messageid,{message:newmessage, isEdited:true});
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
  console.log(error)
  throw new Error('Failed to reset chat list.');
}



}

const deletechatbox=async(req,res)=>{
  const sender = req.user.id;
    const { receiver } = req.params;
    const query = {
        $or: [
            { channel: `${sender}-${receiver}` },
            { channel: `${receiver}-${sender}` }
        ]
    }

    try {
        const messages = await messageSchema.find(query);
        if (messages?.length === 0)  res.status(200).json({
            statusCode: 401,
            message: 'Messages not found!'
        });
        messages.forEach(async (msg) => {
          if (Types.ObjectId.isValid(msg?.deletedBy) && msg?.deletedBy.toString() !== loginUser) {
             await messageSchema.findByIdAndUpdate(msg._id,{$set:{isDeletedForEveryone:true}}); 
          } else {
              // if not deleted earlier from one side, then update deleteBy from loginUser
              await messageSchema.findByIdAndUpdate(msg?._id, { $set: { deletedBy: sender } });
          }
      })
      let chat = await chatlist.find(query);
        // if chat-box is already  udeleted by otherser then remove chat-box
        if (Types.ObjectId.isValid(chat?.deletedBy) && chat?.deletedBy.toString() !== sender) {
            // remove chat-box from db
            chat = await chatlist.findByIdAndDelete(chat._id);
        } else {
            // update chat-box
            
            chat = await updateChat({ _id: chat?._id }, {
                $set: { deletedBy: sender }
            });
            
        }
        res.status(200).json({ status: 'success', message: 'chatbox deleted successfully.' });

}catch(error){
  res.status(500).json({ status: 'error', message: 'Internal server error.' });
                
}}
const flagMessage = async (req, res, next) => {
  const userId = req.user.id;
  const { messageId } = req.params;

  try {
      const message = await messageSchema.findById(messageId)
      if (!message) return next({
          statusCode: 401,
          message: 'Messages not found!'
      });

      if (message?.sender.toString() !== userId) {
          const message = await messageSchema.findByIdAndUpdate(messageId, { $set: { flaggedBy: userId } });
          res.status(200).json({ status: 'success', message: 'MessageReported successfully.' });
      }
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
}

const addmessagereaction=async(req,res)=>{
  try{
    const {reactionid,messageid}=parsebody(req.body);
    const sender=req.user.id;
    //check if message found or not
    const message = await messageSchema.findById(messageid)
    if (!message) return next({
        statusCode: 401,
        message: 'Messages not found!'
    });
   message= await messageSchema.findOneAndUpdate(messageid,{$set:{addmessagereaction:reactionid}});
    addreactionIO(message);
    res.status(200).json({ status: 'success', message: 'Message reaction added ' });
    //then just add reaction in message

  }catch(error){
    res.status(500).json({ status: 'error', message: 'Internal server error.' });
  }
}

const getchatlist=async(req,res)=>{

}
module.exports={
  sendMessage,
  deletemessage,
  getMessages,
  deletemessageforeveryone,
  clearchat,
  editMessage,
  deletechatbox,
  flagMessage,
  addmessagereaction}