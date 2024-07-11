const { isDate, isISO8601 } = require('validator');
const Event= require('../models/events.js')
const validateEventDetails = async(eventDetails) => {
  const { name, date, time, location } = eventDetails;
  
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string.');
  }
  try {
    const existingEvent = await Event.findOne({ name: name });
    if (existingEvent) {
      errors.push('An event with this name already exists.');
    }
  } catch (error) {
    console.error('Error checking event existence:', error);
    errors.push('Server error while checking event existence.');
  }
   

  if (!date || !isISO8601(date)) {
    errors.push('A valid date in ISO 8601 format is required.');
  }

  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    errors.push('A valid time in HH:MM format is required.');
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.push('Location is required and must be a non-empty string.');
  }

  return errors;
};

module.exports = {
  validateEventDetails
};