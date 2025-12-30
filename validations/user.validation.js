import Joi from 'joi';

export const registerSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('Male', 'Female', 'Other'),
    address: Joi.string().allow(''),
    profilePic: Joi.string().allow('')
});

export const updateProfileSchema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    gender: Joi.string().valid('Male', 'Female', 'Other'),
    address: Joi.string().allow(''),
    profilePic: Joi.string().allow('')
});

export const paginationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(5),
});

export const mongoIdParamSchema = Joi.object({
    friendId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});
