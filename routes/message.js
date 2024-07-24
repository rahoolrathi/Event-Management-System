const express=require('express')
const messageController=require('../controllers/message.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
const  {uploads} = require('../utils/multer.js');
console.log(uploads)
router.post('/sendMessage',[protect],uploads.single('files'),messageController.sendMessage);
router.delete('/deleteMessage/:messageid',[protect],messageController.deletemessage);
router.get('/seenMessages/:receiver',[protect],messageController.seenMessage);
router.get('/unseenMessagecount/:receiver',[protect],messageController.unseenMessagecount);
router.get('/unreadcountchannels',[protect],messageController.unreadcountchannels);
router.patch('/editMessage', [protect], messageController.editMessage);
module.exports=router;