const socketIo=require('socket.io');
const {socketauthenticate}=require('./middleware/socketauth.js');
const { response } = require('./app.js');
let io;
exports.io=(server)=>{
   io=socketIo(server);
   //we are using middle before connecting for handling multiple events like
   //authincate,validating data, roles and other thing
   io.use(socketauthenticate).on('connect',(socket)=>{
    console.log(`${socket.id} Client Connected`);
    //socket.data we aere using for sending data to diffwerent servers
    //console.log(socket.handshake); // details about the handshake data will be displayed how connection is upgraded
    //console.log(socket.rooms)//it will display one because by default each user has it on room
  
    //io.in(theSocketId).socketsJoin("room1"); client will join in room1
    //io.in(theSocketId).socketsLeave("room1"); for leaving the room

    //we can also fetch socket in sepefic rooms

    //-----------------------------------------------------------//

    //Events
    //1)Emit we are using this to firing a event
    //syntax
    //socket.emit("eventname",data)
     /*
     we can send any data like buffer,array or objects

     Acknowledgments
     we can send ack to emit in response of on handler
     socke.in("eventnane",(ards,callback)=>{
        callback({
        status:ok
        })
        })
    socket.emit("eventname",data,(response)=>{
        console.log(response.status)
        })

        we can use this with time out too
        socket.timeout(5000).emit("name"(err,response)=>{
            })
     if we want discard events if clients is not connected then use vilate events
     */

     //Listing event (on)
     /*
    socket.on("eventname",(args,callback)=>{
        })
    socket.once()=>if we want to listen only one time
     */
    /*
    boradcasting event
    to event
    rooms
    
    */
    

    socket.on("disconnect", (reason) => {
        console.log(`${socket.id} Disconnected because ${reason}`)
      });  
   })   
};

exports.sendMessageIO = (receiver, content) => {
    console.log(`Emitting event: sendmessage-${receiver}`, content);
    io.emit(`sendmessage-${receiver}`, content);
  };
  
exports.DeleteMessageIO=(receiver,content)=>io.emit(`deletemesssageforme-${receiver}`,content);
exports.seenMessageIO=(message)=>io.emit(`seenMessage-${message._id}`,message);
exports.notificationCount = ({ count, userId }) => {
    io.emit(`notification-count-${userId}`, count);
};
exports.EditMessageIO=(message)=>io.emit(`EditMessage-${message._id}`,message);
exports.addreactionIO=(message)=>io.emit(`addreaction-${message._id}`,message);
exports.resetChatIO = (chatId, data) => io.emit(`reset-chat-${chatId}`, data);

exports.deleteMessageForAllIO = (message) => io.emit(`delete-for-all-${message?._id}`, message);


exports.unSeenMessageCount = (receiver, count) => io.emit(`unseen-messages-count-${receiver}`, count);

exports.unSeenMessageCountChannel = (receiver, count,channel) => io.emit(`unseen-read-count-${receiver}`, {count,channel});