const express = require('express');
const app = express();
app.use(express.json());


const usersRouter = require('./routes/users');
const eventsRouter=require('./routes/events');
const requestRouter=require('./routes/request.js');

app.use('/requests',requestRouter);
app.use('/users', usersRouter);
app.use('/events',eventsRouter);
module.exports = app;
