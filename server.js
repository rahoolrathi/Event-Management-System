const http=require('http') //we are importing this module for attaching server with io
const cors = require('cors')
const dotenv=require('dotenv')
const app=require('./app')
const mongoose=require('mongoose')
const {io}=require('./socket.js');
dotenv.config({path:'./config.env'})
const port =process.env.PORT||8000
const server=http.createServer(app);
app.use(cors({ origin: 'http://localhost:8000' }))
io(server);


//cors
/*
corsss origin resuroces sharing mechanisam

defult :browser implements a same-origin policy  but we can chnage it by using core in node js

using cors we can get data from different orgins  by defualt it not

orgins means

A scheme eg. HTTP, HTTPS
A domain eg. localhost, www.corsinnodejs.com
A port eg. 8080, 8888

allwoed to communicate with external servers we have to set cors for this

means agr fronted request backend sa same origin sa kerti tu agr outside kerti tu huma cors set kerna honga
for sharing resuorces on different domain

by defult jo bhi  request fronted backend ko kerti agr wo different origin pa ha tu browser block kerta ha 

*/



mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/eventmanagmentsystem', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Database Connected');
  server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
  });
}).catch((error) => console.log("Error in connecting database:", error));



