import { Server } from 'socket.io';
import logger from './logger.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

let io;
let users = [];

const addUser = (userId, socketId) => {
    const uidStr = String(userId);
    let user = users.find(u => String(u.userId) === uidStr);
    if (user) {
        if (!user.socketIds.includes(socketId)) {
            user.socketIds.push(socketId);
        }
    } else {
        users.push({ userId: uidStr, socketIds: [socketId] });
    }
    return users;
};

const removeUser = (socketId) => {
    users = users.map(user => ({
        ...user,
        socketIds: user.socketIds.filter(sId => sId !== socketId)
    })).filter(user => user.socketIds.length > 0);
    return users;
};

const getUser = (userId) => {
    return users.find(user => String(user.userId) === String(userId));
};

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        logger.info(`User connected: ${socket.id}`);

        socket.on('addUser', (userId) => {
            if (!userId) return;
            addUser(userId, socket.id);
            logger.info(`User ${userId} registered with socket ${socket.id}. Total online: ${users.length}`);
            io.emit('getUsers', users);
        });

        socket.on('sendMessage', async ({ senderId, receiverId, conversationId, text }, callback) => {
            try {
                // SECURITY: Verify sender and receiver are participants in this conversation
                const conversation = await Conversation.findById(conversationId);

                if (!conversation) {
                    logger.warn(`Socket: Attempt to send message to non-existent conversation ${conversationId}`);
                    if (typeof callback === 'function') callback({ status: 'error', message: 'Conversation not found' });
                    return;
                }

                // Check membership
                const isSenderMember = conversation.members.some(m => String(m) === String(senderId));
                const isReceiverMember = conversation.members.some(m => String(m) === String(receiverId));

                if (!isSenderMember) {
                    logger.warn(`Socket Security Alert: User ${senderId} attempted to send message to conversation ${conversationId} without membership.`);
                    if (typeof callback === 'function') callback({ status: 'error', message: 'Unauthorized' });
                    return;
                }

                // SAVE TO DB (Pure Socket Architecture)
                const newMessage = new Message({
                    conversationId,
                    senderId,
                    text
                });
                let savedMessage = await newMessage.save();
                savedMessage = await Message.findById(savedMessage._id).populate('senderId', 'firstName lastName profilePic');

                // Check receiver membership (still good to strictly enforce before emitting, even if saved)
                if (!isReceiverMember) {
                    logger.warn(`Socket: Receiver ${receiverId} is not in conversation ${conversationId}. Msg saved but not emitted.`);
                    // Return success for saving, but note delivery failure (optional)
                    if (typeof callback === 'function') callback({ status: 'ok', data: savedMessage });
                    return;
                }

                const receiver = getUser(receiverId);
                if (receiver && receiver.socketIds && receiver.socketIds.length > 0) {
                    receiver.socketIds.forEach(sId => {
                        io.to(sId).emit('getMessage', savedMessage);
                    });
                    logger.debug(`Message securely delivered from ${senderId} to ${receiverId}`);
                } else {
                    logger.debug(`Receiver ${receiverId} offline. Message saved to DB.`);
                }

                // Acknowledge success to sender with the saved message (so they can update ID)
                if (typeof callback === 'function') callback({ status: 'ok', data: savedMessage });

            } catch (error) {
                logger.error('Socket Error:', error.message);
                if (typeof callback === 'function') callback({ status: 'error', message: error.message });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
            removeUser(socket.id);
            io.emit('getUsers', users);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
