import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

export const findConversation = async (members, product) => {
    return await Conversation.findOne({
        members: { $all: members },
        product: product,
    });
};

export const findConversationPopulated = async (members, product, path, select) => {
    return await Conversation.findOne({
        members: { $all: members },
        product: product,
    }).populate(path, select);
};

export const createConversation = async (convoData) => {
    return await Conversation.create(convoData);
};

export const findConversationByIdPopulated = async (id, path, select) => {
    return await Conversation.findById(id).populate(path, select);
};

export const getConversationsWithAggregate = async (pipeline) => {
    return await Conversation.aggregate(pipeline);
};

export const countMessages = async (query) => {
    return await Message.countDocuments(query);
};

export const distinctConversationIds = async (userId) => {
    return await Conversation.find({ members: userId }).distinct('_id');
};

export const updateManyMessages = async (query, update) => {
    return await Message.updateMany(query, update);
};

export const createMessage = async (messageData) => {
    return await Message.create(messageData);
};

export const findConversationByIdAndUpdate = async (id, update) => {
    return await Conversation.findByIdAndUpdate(id, update);
};

export const findMessageByIdPopulated = async (id, path, select) => {
    return await Message.findById(id).populate(path, select);
};

export const findMessagesByConversationPopulated = async (conversationId, skip, limit, sort, path, select) => {
    return await Message.find({ conversationId })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate(path, select);
};
