const express=require('express')
const userController=require('../controllers/users.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
router.post('/signup',userController.signup);
router.post('/sendotp',protect,userController.sendOTP);
router.post('/verifyotp',userController.VerifyOTP);
router.post('/signin',userController.Signin);

module.exports=router;
