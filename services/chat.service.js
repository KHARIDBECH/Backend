import Message from '../models/message.js';
import Conversation from '../models/conversation.js';
import Ad from '../models/product.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const createConversation = async (data) => {
    const { senderId, receiverId, productId } = data;

    const product = await Ad.findById(productId);
    if (!product) {
        throw new ErrorResponse(`Product not found with id of ${productId}`, 404);
    }

    let conversation = await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
        product: productId,
    }).populate('members', 'firstName lastName profilePic');

    if (conversation) {
        return conversation;
    }

    conversation = await Conversation.create({
        members: [senderId, receiverId],
        product: productId,
    });

    return await Conversation.findById(conversation._id).populate('members', 'firstName lastName profilePic');
};

export const getConversationsByUser = async (userId) => {
    return await Conversation.find({
        members: { $in: [userId] },
    })
        .populate('members', 'firstName lastName profilePic')
        .sort('-updatedAt');
};

export const createMessage = async (data) => {
    const message = await Message.create(data);

    // Update conversation updatedAt timestamp
    await Conversation.findByIdAndUpdate(data.conversationId, { updatedAt: Date.now() });

    return await Message.findById(message._id).populate('senderId', 'firstName lastName profilePic');
};

export const getMessagesByConversation = async (conversationId, query) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'firstName lastName profilePic');

    const total = await Message.countDocuments({ conversationId });

    return {
        messages: messages.reverse(),
        total,
        page,
        hasMore: total > page * limit
    };
};
