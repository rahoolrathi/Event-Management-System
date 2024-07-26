const { promisify } = require('util');
const redisclient = require('./redisclient.js');




exports.addEventToRedis = async (event) => {
  try {
    const eventKey = `event:${event.name}`;
    // Store the event JSON in Redis hash with the event name as the field
   
   let result= await redisclient.hSet(eventKey, 'details', JSON.stringify(event));
    console.log('Returning result:', result);
    // Set the expiration for the event to 30 days
    const expirationInSeconds = 30 * 24 * 60 * 60; // 30 days in seconds
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
    const eventJson = await redisclient.hGet(eventKey, 'details');

    if (eventJson) {
      const event = JSON.parse(eventJson);
      console.log('Event retrieved:', event);
      return event;
    } else {
      console.log('No event found for name:', eventName);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving event from Redis:', error);
    //throw error;
  }
};
