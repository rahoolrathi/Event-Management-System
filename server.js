const http=require('http') //we are importing this module for attaching server with io
const dotenv=require('dotenv')
const app=require('./app')
const mongoose=require('mongoose')
const {io}=require('./socket.js');
dotenv.config({path:'./config.env'})
console.log(process.env.PORT)
const port =process.env.PORT||8000
const server=http.createServer(app);
io(server);

mongoose.set('strictQuery',true);
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('Database Connected');
    server.listen(process.env.PORT,()=>{
        console.log(`server is runing on port ${port}`)
    })
}).catch(()=>console.log("Error in connecting database"))


