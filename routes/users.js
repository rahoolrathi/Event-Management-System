const express=require('express')
const userController=require('../controllers/users.js')
const router=express.Router();
const { handleMultipartData } = require('../utils/multer');
const  protect  = require('../middleware/authcontoller.js');
router.post('/signup',userController.signup);
router.post('/sendotp',userController.sendOTP);
router.post('/verifyotp',userController.VerifyOTP);
router.post('/signin',userController.Signin);
router.post('/blockuser/:useremail',[protect],userController.blockUser);
router.post('/upload',handleMultipartData.single('file'),(req,res)=>{
    res.send('uploaded');
})

module.exports=router;
