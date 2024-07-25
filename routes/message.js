const express=require('express')
const messageController=require('../controllers/message.js')
const router=express.Router();
const  protect  = require('../middleware/authcontoller.js');
const  {uploads} = require('../utils/multer.js');
router.post('/sendmessage', [protect], uploads.fields([{ name: 'media', maxCount: 500 }]), messageController.sendMessage);
router.delete('/delete/:messageId', [protect], messageController.deletemessage);
router.delete('/deleteforeveryone/:messageid', [protect], messageController.deletemessageforeveryone);
router.patch('/editmessage',[protect],messageController.editMessage);
router.patch('/reportmessage/:messageId',[protect],messageController.flagMessage);
router.get('/getmessage/receiver',[protect],messageController.getMessages);
router.patch('/addreaction',[protect],messageController.addmessagereaction);
router.delete('/clearchat/:receiver',[protect],messageController.clearchat);
router.delete('/deletechatbox/:receiver',[protect],messageController.deletechatbox);
//router.get('/chatlist',[protect],messageController.ge);

module.exports=router;