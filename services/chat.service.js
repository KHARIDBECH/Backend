import mongoose from 'mongoose';
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
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.aggregate([
        { $match: { members: userIdObj } },
        { $sort: { updatedAt: -1 } },
        {
            $lookup: {
                from: 'messages',
                let: { convoId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$conversationId', '$$convoId'] } } },
                    { $sort: { createdAt: -1 } },
                    {
                        $group: {
                            _id: '$conversationId',
                            lastMessage: { $first: '$$ROOT' },
                            unreadCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ['$senderId', userIdObj] },
                                                { $eq: ['$isRead', false] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ],
                as: 'chatInfo'
            }
        },
        {
            $unwind: {
                path: '$chatInfo',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                lastMessage: '$chatInfo.lastMessage',
                unreadCount: { $ifNull: ['$chatInfo.unreadCount', 0] }
            }
        },
        { $project: { chatInfo: 0 } },
        // Populate Members
        {
            $lookup: {
                from: 'users',
                localField: 'members',
                foreignField: '_id',
                as: 'members'
            }
        },
        // Filter member fields to match what frontend expects
        {
            $addFields: {
                members: {
                    $map: {
                        input: '$members',
                        as: 'm',
                        in: {
                            _id: '$$m._id',
                            firstName: '$$m.firstName',
                            lastName: '$$m.lastName',
                            profilePic: '$$m.profilePic'
                        }
                    }
                }
            }
        },
        // Populate Product
        {
            $lookup: {
                from: 'ads',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        {
            $addFields: {
                product: { $arrayElemAt: ['$product', 0] }
            }
        }
    ]);

    return conversations;
};

export const findConversation = async (senderId, receiverId, productId) => {
    return await Conversation.findOne({
        members: { $all: [senderId, receiverId] },
        product: productId,
    }).populate('members', 'firstName lastName profilePic');
};

export const getUnreadCountByUserId = async (userId) => {
    return await Message.countDocuments({
        senderId: { $ne: userId },
        isRead: false,
        conversationId: {
            $in: await Conversation.find({ members: userId }).distinct('_id')
        }
    });
};

export const markMessagesAsRead = async (conversationId, userId) => {
    return await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            isRead: false
        },
        { $set: { isRead: true } }
    );
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
