const express=require('express')
const userController=require('../controllers/users.js')
const router=express.Router();

router.post('/signup',userController.signup);
router.post('/sendotp',userController.sendOTP);
router.post('/verifyotp',userController.VerifyOTP);

module.exports=router;
