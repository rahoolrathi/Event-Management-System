const dotenv=require('dotenv')
const app=require('./app')

const mongoose=require('mongoose')
dotenv.config({path:'./config.env'})


const port =process.env.PORT||3000

mongoose.set('strictQuery',true);
mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log('Database Connected');
    app.listen(3000,()=>{
        console.log(`server is runing on port ${port}`)
    })
}).catch(()=>console.log("Error in connecting database"))


