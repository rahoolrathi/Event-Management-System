const express = require('express');
const app = express();
app.use(express.json());

const usersRouter = require('./routes/users');
const eventsRouter=require('./routes/events')

app.use('/users', usersRouter);
app.use('/events',eventsRouter);
module.exports = app;
