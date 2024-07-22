const express=require('express')
const messageController=require('../controllers/message.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
const  {uploads} = require('../utils/multer.js');
console.log(uploads)
router.post('/sendMessage',[protect],uploads.single('files'),messageController.sendMessage);
router.delete('/deleteMessage',[protect],messageController.deletemessage);

module.exports=router;