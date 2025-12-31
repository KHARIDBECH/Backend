import Joi from 'joi';

export const createProductSchema = Joi.object({
    title: Joi.string().required().max(100),
    description: Joi.string().required().max(1000),
    price: Joi.number().required().min(0),
    category: Joi.string().required(),
    subcategory: Joi.string().required(),
    condition: Joi.string().valid('New', 'Used', 'Refurbished').required(),
    negotiable: Joi.boolean(),
    location: Joi.object({
        city: Joi.string().required(),
        state: Joi.string().required()
    }).required(),
});

export const updateProductSchema = Joi.object({
    title: Joi.string().max(100),
    description: Joi.string().max(2000),
    price: Joi.number().min(0),
    category: Joi.string(),
    subcategory: Joi.string(),
    condition: Joi.string().valid('New', 'Used', 'Refurbished'),
    negotiable: Joi.boolean(),
    location: Joi.object({
        city: Joi.string(),
        state: Joi.string()
    })
});

export const productQuerySchema = Joi.object({
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    category: Joi.string().allow(''),
    search: Joi.string().allow('').optional()
});

export const productIdParamSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const itemIdParamSchema = Joi.object({
    itemid: Joi.string().required()
});

export const categoryParamSchema = Joi.object({
    category: Joi.string().required()
});
