const express=require('express')
const EventController=require('../controllers/events.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
router.post('/createEvent',[protect],EventController.createEvent);
router.post('/joinEvent/:eventName',[protect],EventController.joinEvent);
module.exports=router;