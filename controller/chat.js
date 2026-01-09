import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../middleware/asyncHandler.js';
import * as chatService from '../services/chat.service.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Create or get existing conversation
// @route   POST /api/chatConvo
// @access  Private
export const createConvo = asyncHandler(async (req, res, next) => {
    const conversation = await chatService.createConversation(req.body);
    return sendResponse(res, StatusCodes.CREATED, conversation, 'Conversation created or retrieved successfully');
});

// @desc    Get conversations for a user
// @route   GET /api/chatConvo/:userId
// @access  Private
export const getConvo = asyncHandler(async (req, res, next) => {
    const conversations = await chatService.getConversationsByUser(req.params.userId);
    return sendResponse(res, StatusCodes.OK, conversations, 'Conversations fetched successfully');
});

// @desc    Find a specific conversation
// @route   GET /api/chatConvo/find
// @access  Private
export const findConvo = asyncHandler(async (req, res, next) => {
    const { receiverId, productId } = req.query;
    const conversation = await chatService.findConversation(req.user._id, receiverId, productId);
    return sendResponse(res, StatusCodes.OK, conversation, conversation ? 'Conversation found' : 'No existing conversation found');
});

// @desc    Get total unread message count for a user
// @route   GET /api/chatConvo/unread/count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await chatService.getUnreadCountByUserId(req.user._id);
    return sendResponse(res, StatusCodes.OK, { count }, 'Unread message count fetched successfully');
});

// @desc    Mark messages in a conversation as read
// @route   PATCH /api/chatConvo/read/:conversationId
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
    await chatService.markMessagesAsRead(req.params.conversationId, req.user._id);
    return sendResponse(res, StatusCodes.OK, {}, 'Messages marked as read');
});

// @desc    Add a message to a conversation
// @route   POST /api/chatMessages
// @access  Private
export const addMessage = asyncHandler(async (req, res, next) => {
    const message = await chatService.createMessage(req.body);
    return sendResponse(res, StatusCodes.CREATED, message, 'Message sent successfully');
});

// @desc    Get messages for a conversation with pagination
// @route   GET /api/chatMessages/:conversationId
// @access  Private
export const getMessage = asyncHandler(async (req, res, next) => {
    const result = await chatService.getMessagesByConversation(req.params.conversationId, req.query);
    return sendResponse(res, StatusCodes.OK, result, 'Messages fetched successfully');
});
