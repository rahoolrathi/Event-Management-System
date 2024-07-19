const socketio=require('socket.io')

exports.io=(server)=>{
    io=socketio(server);
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
          });
      });  
}
