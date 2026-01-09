import mongoose from 'mongoose';
import * as chatRepository from '../repositories/chat.repository.js';
import * as productRepository from '../repositories/product.repository.js';
import ErrorResponse from '../utils/ErrorResponse.js';

export const createConversation = async (data) => {
    const { senderId, receiverId, productId } = data;

    const product = await productRepository.findById(productId);
    if (!product) {
        throw new ErrorResponse(`Product not found with id of ${productId}`, 404);
    }

    let conversation = await chatRepository.findConversationPopulated(
        [senderId, receiverId],
        productId,
        'members',
        'firstName lastName profilePic'
    );

    if (conversation) {
        return conversation;
    }

    conversation = await chatRepository.createConversation({
        members: [senderId, receiverId],
        product: productId,
    });

    return await chatRepository.findConversationByIdPopulated(conversation._id, 'members', 'firstName lastName profilePic');
};

export const getConversationsByUser = async (userId) => {
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const pipeline = [
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
    ];

    return await chatRepository.getConversationsWithAggregate(pipeline);
};

export const findConversation = async (senderId, receiverId, productId) => {
    return await chatRepository.findConversationPopulated(
        [senderId, receiverId],
        productId,
        'members',
        'firstName lastName profilePic'
    );
};

export const getUnreadCountByUserId = async (userId) => {
    return await chatRepository.countMessages({
        senderId: { $ne: userId },
        isRead: false,
        conversationId: {
            $in: await chatRepository.distinctConversationIds(userId)
        }
    });
};

export const markMessagesAsRead = async (conversationId, userId) => {
    return await chatRepository.updateManyMessages(
        {
            conversationId,
            senderId: { $ne: userId },
            isRead: false
        },
        { $set: { isRead: true } }
    );
};

export const createMessage = async (data) => {
    const message = await chatRepository.createMessage(data);

    // Update conversation updatedAt timestamp
    await chatRepository.findConversationByIdAndUpdate(data.conversationId, { updatedAt: Date.now() });

    return await chatRepository.findMessageByIdPopulated(message._id, 'senderId', 'firstName lastName profilePic');
};

export const getMessagesByConversation = async (conversationId, query) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const messages = await chatRepository.findMessagesByConversationPopulated(
        conversationId,
        skip,
        limit,
        '-createdAt',
        'senderId',
        'firstName lastName profilePic'
    );

    const total = await chatRepository.countMessages({ conversationId });

    return {
        messages: messages.reverse(),
        total,
        page,
        hasMore: total > page * limit
    };
};
