const { isDate, isISO8601 } = require('validator');
const Event= require('../models/events.js');
const message = require('../models/message.js');

exports.parsebody = (body) => {
  //we are using this function for converting body in json object user can send in any format
  let obj;
  console.log(body); // For debugging purposes

  if (typeof body === "object") {
      obj = body; // If body is already an object, assign it directly
  } else {
      obj = JSON.parse(body); // If body is a string, parse it into an object
  }

  return obj; // Return the parsed object
}

// aggregate pagination with mongoose paginate library
exports.getMongooseAggregatePaginatedData = async ({
    model, page = 1, limit = 10, query = [], populate = '', select = '-password', sort = { createdAt: 1 },
}) => {
    const options = {
        select,
        sort,
        lean: true,
        page,
        populate,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const myAggregate = model.aggregate(query);
    const { data, pagination } = await model.aggregatePaginate(myAggregate, options);
  
    delete pagination.limit;
    delete pagination.pagingCounter;

    return { data, pagination };
}
exports.getMongoosePaginatedData = async ({
  model, page = 1, limit = 10, query = {}, populate = '', select = '-password', sort = { createdAt: 1 },
}) => {
  const options = {
      select,
      sort,
      populate,
      lean: true,
      page,
      limit,
      customLabels: {
          totalDocs: 'totalItems',
          docs: 'data',
          page: 'currentPage',
          meta: 'pagination',
      },
  };

  const { data, pagination } = await model.paginate(query, options);

  delete pagination.limit;
  delete pagination.pagingCounter;

  return { data, pagination };
}
exports.validateEventDetails = async(eventDetails) => {
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

exports.generateResponse = (data, message, res) => {
  console.log('hello',data);
  return res.status(STATUS_CODE.OK).send({
      status:true,
      data,
      message,
  });
}
