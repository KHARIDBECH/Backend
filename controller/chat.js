import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../middleware/asyncHandler.js';
import * as chatService from '../services/chat.service.js';

// @desc    Create or get existing conversation
// @route   POST /api/chatConvo
// @access  Private
export const createConvo = asyncHandler(async (req, res, next) => {
    const conversation = await chatService.createConversation(req.body);

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: conversation
    });
});

// @desc    Get conversations for a user
// @route   GET /api/chatConvo/:userId
// @access  Private
export const getConvo = asyncHandler(async (req, res, next) => {
    const conversations = await chatService.getConversationsByUser(req.params.userId);

    res.status(StatusCodes.OK).json({
        success: true,
        count: conversations.length,
        data: conversations
    });
});

// @desc    Add a message to a conversation
// @route   POST /api/chatMessages
// @access  Private
export const addMessage = asyncHandler(async (req, res, next) => {
    const message = await chatService.createMessage(req.body);

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: message
    });
});

// @desc    Get messages for a conversation with pagination
// @route   GET /api/chatMessages/:conversationId
// @access  Private
export const getMessage = asyncHandler(async (req, res, next) => {
    const result = await chatService.getMessagesByConversation(req.params.conversationId, req.query);

    res.status(StatusCodes.OK).json({
        success: true,
        count: result.messages.length,
        total: result.total,
        page: result.page,
        hasMore: result.hasMore,
        data: result.messages
    });
});
