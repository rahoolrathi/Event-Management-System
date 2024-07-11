const express=require('express')
const EventController=require('../controllers/events.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
router.post('/createEvent',[protect],EventController.createEvent);
router.post('/joinEvent/:eventName',[protect],EventController.joinEvent);
router.post('/completeEvent/:eventName',[protect],EventController.completeEvent);
router.put('/editEvent/:eventName',[protect],EventController.editEvent);
router.delete('/deleteEvent/:eventName',[protect],EventController.deleteEvent)
module.exports=router;