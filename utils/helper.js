const { isDate, isISO8601 } = require('validator');

const validateEventDetails = (eventDetails) => {
  const { name, date, time, location } = eventDetails;
  
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string.');
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