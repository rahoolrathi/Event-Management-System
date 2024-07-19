const socketIo=require('socket.io');
const {socketauthenticate}=require('./middleware/socketauth.js');

exports.io=(server)=>{
   io=socketIo(server);
   //we are using middle before connecting for handling multiple events like
   //authincate,validating data, roles and other thing
   io.use(socketauthenticate).on('connect',(socket)=>{
    //console.log(`${socket.id} Client Connected`);
    //socket.data we aere using for sending data to diffwerent servers
    //console.log(socket.handshake); // details about the handshake data will be displayed how connection is upgraded
    //console.log(socket.rooms)//it will display one because by default each user has it on room
  
    //io.in(theSocketId).socketsJoin("room1"); client will join in room1
    //io.in(theSocketId).socketsLeave("room1"); for leaving the room

    //we can also fetch socket in sepefic rooms
    socket.on("disconnect", (reason) => {
        console.log(`${socket.id} Disconnected because ${reason}`)
      });  
   })   
}