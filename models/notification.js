const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;
const NOTIFICATION_TYPE = require('../utils/constants.js');
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const admin = require('../firebase.js');

const receiversSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isRead: { type: Boolean, default: false },
  },
  { _id: false }
);

const notificationSchema = new Schema({
  receivers: [receiversSchema], // Should be an array
  sender: {
    type: Types.ObjectId,
    ref: 'User', // Ensure this matches the correct reference name
  },
  title: {
    type: String, default: null
  },
  body: {
    type: String, default: null
  },
  type: {
    type: String,
    enum: Object.values(NOTIFICATION_TYPE),
    required: true,
  },
  image: {
    type: String,
    default: null,
  }
},
{ timestamps: true }
);

notificationSchema.plugin(mongoosePaginate);
notificationSchema.plugin(aggregatePaginate);

const Notification = model('Notification', notificationSchema);

exports.createAndSendNotification = async (senderObject, receiverId, type, deviceTokens, title, body) => {
  try {
    // Create a 
    console.log("deviceToken>>>>",deviceTokens);
   //  notification record in MongoDB
    const notification = await Notification.create({
      receivers: [
        {
          user: receiverId,
          isRead: false
        }
      ],
      sender: senderObject,
      type,
      title,
      body
    });

    console.log("This is the notification:", notification);

    // Send the notification using FCM
    await sendNotification(title, body, deviceTokens);
  } catch (error) {
    console.error('Error creating and sending notification:', error);
  }
};

async function sendNotification(title, body, deviceTokens) {
  try {
    // Ensure deviceTokens is an array
    if (!Array.isArray(deviceTokens)) {
      deviceTokens = [deviceTokens];
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      tokens: deviceTokens // Array of device tokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Notification sent successfully:', response);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
