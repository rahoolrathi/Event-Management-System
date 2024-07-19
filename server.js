const dotenv=require('dotenv')
const app=require('./app')
const http=require('http');
const mongoose=require('mongoose')
const {io}=require('./socket')
dotenv.config({path:'./config.env'})
const server = http.createServer(app);
console.log(process.env.PORT)
const port =process.env.PORT||8000
io(server)
//io(server)
mongoose.set('strictQuery',true);
mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log('Database Connected');
    server.listen(process.env.PORT,()=>{
        console.log(`server is runing on port ${port}`)
    })
}).catch(()=>console.log("Error in connecting database"))


