const dotenv=require('dotenv')
const app=require('./app')

const mongoose=require('mongoose')
dotenv.config({path:'./config.env'})

console.log(process.env.PORT)
const port =process.env.PORT||8000

mongoose.set('strictQuery',true);
mongoose.connect(process.env.DATABASE_URL).then(()=>{
    console.log('Database Connected');
    app.listen(8000,()=>{
        console.log(`server is runing on port ${port}`)
    })
}).catch(()=>console.log("Error in connecting database"))


