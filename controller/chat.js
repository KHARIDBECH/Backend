import logger from '../utils/logger.js';
import Joi from 'joi';
import Ad from '../models/product.js';
import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

// Schemas for validation
const createConvoSchema = Joi.object({
    senderId: Joi.string().required(),
    receiverId: Joi.string().required(),
    productId: Joi.string().required(),
});

const addMessageSchema = Joi.object({
    conversationId: Joi.string().required(),
    senderId: Joi.string().required(),
    text: Joi.string().required(),
});

// @desc    Create or get existing conversation
// @route   POST /api/chatConvo
// @access  Private
export const createConvo = asyncHandler(async (req, res, next) => {
    const { senderId, receiverId, productId } = req.body;

    const { error } = createConvoSchema.validate(req.body);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }

    const product = await Ad.findById(productId);
    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${productId}`, 404));
    }

    let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
        product: productId,
    });

    if (conversation) {
        return res.status(200).json({
            success: true,
            data: conversation
        });
    }

    conversation = await Conversation.create({
        members: [senderId, receiverId],
        product: productId,
    });

    res.status(201).json({
        success: true,
        data: conversation
    });
});

// @desc    Get conversations for a user
// @route   GET /api/chatConvo/:userId
// @access  Private
export const getConvo = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;

    if (!userId) {
        return next(new ErrorResponse('User ID is required', 400));
    }

    const conversations = await Conversation.find({
        members: { $in: [userId] },
    }).sort('-updatedAt');

    res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations
    });
});

// @desc    Add a message to a conversation
// @route   POST /api/chatMessages
// @access  Private
export const addMessage = asyncHandler(async (req, res, next) => {
    const { error } = addMessageSchema.validate(req.body);
    if (error) {
        return next(new ErrorResponse(error.details[0].message, 400));
    }

    const message = await Message.create(req.body);

    res.status(201).json({
        success: true,
        data: message
    });
});

// @desc    Get messages for a conversation
// @route   GET /api/chatMessages/:conversationId
// @access  Private
export const getMessage = asyncHandler(async (req, res, next) => {
    const { conversationId } = req.params;

    if (!conversationId) {
        return next(new ErrorResponse('Conversation ID is required', 400));
    }

    const messages = await Message.find({ conversationId }).sort('createdAt');

    res.status(200).json({
        success: true,
        count: messages.length,
        data: messages
    });
});
