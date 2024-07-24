const joi=require('joi');
exports.sendMessageValidations=joi.object({
 receiver:joi.string().required(),
 parent:joi.string().optional(),
 message:joi.string().optional()
})