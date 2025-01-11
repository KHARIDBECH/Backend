const Conversation = require('../models/conversation');
const message = require('../models/message');
const Joi = require('joi');
const logger = require('../utils/logger');
const Ad = require('../models/product');
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

// Conversation start
exports.createConvo = async (req, res) => {
    const { senderId, receiverId, productId } = req.body;

    // Validate request payload
    const { error } = createConvoSchema.validate(req.body);
    if (error) {
        logger.warn("Validation error in createConvo:", error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Ensure the product exists
        const product = await Ad.findById(productId);
        if (!product) {
            logger.warn("Product not found with ID:", productId);
            return res.status(404).json({ message: "Product not found." });
        }

        // Check if a conversation already exists for these members and this product
        const existingConversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
            product: productId,
        });

        if (existingConversation) {
            logger.info("Conversation already exists:", existingConversation);
            return res.status(200).json(existingConversation);
        }

        // Create a new conversation
        const newConversation = new Conversation({
            members: [senderId, receiverId],
            product: productId,
        });

        const savedConversation = await newConversation.save();
        logger.info("Conversation created successfully:", savedConversation);
        res.status(201).json(savedConversation);
    } catch (err) {
        logger.error("Error creating conversation:", err);
        res.status(500).json({ message: "Failed to create conversation.", error: err.message });
    }
};

exports.getConvo = async (req, res) => {
    if (!req.params.userId) {
        logger.warn("Validation error in getConvo: Missing userId");
        return res.status(400).json({ message: "userId is required." });
    }

    try {
        const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
        });

        if (!conversation || conversation.length === 0) {
            logger.warn(`No conversations found for userId: ${req.params.userId}`);
            return res.status(404).json({ message: "No conversations found." });
        }

        logger.info("Conversations retrieved successfully for userId:", req.params.userId);
        res.status(200).json(conversation);
    } catch (err) {
        logger.error("Error retrieving conversations:", err);
        res.status(500).json({ message: "Failed to retrieve conversations.", error: err.message });
    }
};

// Add Message routes logic
exports.addMessage = async (req, res) => {
    const { error } = addMessageSchema.validate(req.body);
    if (error) {
        logger.warn("Validation error in addMessage:", error.details[0].message);
        return res.status(400).json({ message: error.details[0].message });
    }

    const newMessage = new message(req.body);

    try {
        const savedMessage = await newMessage.save();
        logger.info("Message added successfully:", savedMessage);
        res.status(201).json(savedMessage);
    } catch (err) {
        logger.error("Error adding message:", err);
        res.status(500).json({ message: "Failed to add message.", error: err.message });
    }
};

// Get message routes logic
exports.getMessage = async (req, res) => {
    if (!req.params.conversationId) {
        logger.warn("Validation error in getMessage: Missing conversationId");
        return res.status(400).json({ message: "conversationId is required." });
    }

    try {
        const messages = await message.find({ conversationId: req.params.conversationId });

        if (!messages || messages.length === 0) {
            logger.warn(`No messages found for conversationId: ${req.params.conversationId}`);
            return res.status(404).json({ message: "No messages found." });
        }

        logger.info("Messages retrieved successfully for conversationId:", req.params.conversationId);
        res.status(200).json(messages);
    } catch (err) {
        logger.error("Error retrieving messages:", err);
        res.status(500).json({ message: "Failed to retrieve messages.", error: err.message });
    }
};
