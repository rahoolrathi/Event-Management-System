const express = require('express');
const app = express();
app.use(express.json());


const usersRouter = require('./routes/users');
const eventsRouter=require('./routes/events');
const requestRouter=require('./routes/request.js');
const messageRouter=require('./routes/message.js');
app.use('/messages',messageRouter);
app.use('/requests',requestRouter);
app.use('/users', usersRouter);
app.use('/events',eventsRouter);
module.exports = app;
