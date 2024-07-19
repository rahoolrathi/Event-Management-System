const  jwt = require("jsonwebtoken");
exports.socketauthenticate=(socket,next)=>{
    const token=socket.handshake.headers.token;
    if(token){
        jwt.verify(
            socket.handshake.headers.token,
            process.env.JWT_SECRET,(err, decoded) => {
              if (err) {
                return next(new Error("Authentication error"));
              }
              socket.decoded = decoded; // we are stroing decoded token  for future use
              socket.userId =  decoded.id //storing decoed token id as user id to identify user
              /*
               why we are using userid if we have already socket.id
               because we cant trust on socket.id it will change if user diconnected or refresh page or any
               other issue happened
               userid will remain until token is same so we can use this for feature purpose
              */
              next();
            })
                
    }else{
        next(new Error("Authentication error"));
    }
}