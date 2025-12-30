import Joi from 'joi';

export const createConvoSchema = Joi.object({
    senderId: Joi.string().required(),
    receiverId: Joi.string().required(),
    productId: Joi.string().required(),
});

export const addMessageSchema = Joi.object({
    conversationId: Joi.string().required(),
    senderId: Joi.string().required(),
    text: Joi.string().required(),
});

export const paginationSchema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
});

export const mongoIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const conversationIdParamSchema = Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

export const userIdParamSchema = Joi.object({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});
