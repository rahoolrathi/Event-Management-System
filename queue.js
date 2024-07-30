const { promisify } = require('util');
const redisclient = require('./redisclient.js');



const FIELD='data';
exports.addEventToRedis = async (event) => {
  try {
    const eventKey = `event:${event.name}`;
   let result= await redisclient.hSet(eventKey, FIELD,JSON.stringify(event));
    console.log('Returning result:', result);
    const expirationInSeconds = 30 * 2; 
    await redisclient.expire(eventKey, expirationInSeconds);
    
    console.log(`Event added to hash with key ${eventKey} and expiration set for 30 days.`);
    return {
        status: 'success',
        message: `Event added with key ${eventKey}`,
        key: eventKey
      };
  } catch (error) { 
    console.error('Error adding event to Redis:', error);
    return error;
  }
};


exports.getEventFromRedis = async (eventName) => {
  try {
    const eventKey = `event:${eventName}`;
   
    // Get the event JSON from the Redis hash
    const eventJson = await redisclient.hGet(eventKey,FIELD);
    if (eventJson) {
      const event = JSON.parse(eventJson);
      console.log("----------------------------")
      return event;
    } else {
      console.log('No event found for name:', eventName);
      return null;
    }
  } catch (error) {
    throw error;
  }
};
