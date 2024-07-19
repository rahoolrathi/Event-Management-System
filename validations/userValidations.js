const joi=require('joi');



exports.registeruservalidtions = joi.object({
    firstname: joi.string().required().messages({
        'any.required': "First Name is required",
        'string.empty': 'Name cannot be empty'
    }),
    lastname: joi.string().optional(),
    profileImage: joi.string().optional(),
    email: joi.string().required().messages({
        'any.required': "Email is required",
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email'
    }),
    password: joi.string().min(8).max(100).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be at most 100 characters'
    })
}).messages({
    'object.unknown': 'Invalid field {#label}'
});

exports.loginValidtions = joi.object({
    email: joi.string().required().messages({
        'any.required': "Email is required",
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email'
    }),
    password: joi.string().min(8).max(100).required().messages({
        'any.required': 'Password is required.',
        'string.empty': 'Password cannot be empty.',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be at most 100 characters'
    })
}).messages({
    'object.unknown': 'Invalid field {#label}'
});



exports.emailValidator=joi.object({
    email: joi.string().required().messages({
        'any.required': "Email is required",
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please enter a valid email'
    }),
}).messages({
    'object.unknown': 'Invalid field {#label}'
});