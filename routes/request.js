const express=require('express')
const RequestController=require('../controllers/request.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');

router.post('/sendRequest/:recipientemail',[protect],RequestController.createRequest);
router.post('/acceptRequest/:requestid',[protect],RequestController.acceptRequest);
router.post('/rejectRequest/:requestid',[protect],RequestController.rejectRequest);


module.exports=router;