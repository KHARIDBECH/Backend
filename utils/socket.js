import { Server } from 'socket.io';
import logger from './logger.js';

let io;
let users = [];

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
            const uidStr = String(userId);
            let user = users.find(u => String(u.userId) === uidStr);

            if (user) {
                if (!user.socketIds.includes(socket.id)) {
                    user.socketIds.push(socket.id);
                }
            } else {
                users.push({ userId: uidStr, socketIds: [socket.id] });
            }
            logger.info(`User ${uidStr} registered with socket ${socket.id}`);
        });

        socket.on('sendMessage', ({ sender, receiverId, text }) => {
            const ridStr = String(receiverId);
            const receiver = users.find(user => String(user.userId) === ridStr);

            if (receiver && receiver.socketIds && receiver.socketIds.length > 0) {
                receiver.socketIds.forEach(sId => {
                    io.to(sId).emit('getMessage', {
                        senderId: sender, // Can be object or string ID
                        text,
                    });
                });
                logger.debug(`Message delivered from ${sender?._id || sender} to ${ridStr}`);
            } else {
                logger.debug(`Receiver ${ridStr} offline, message stored in DB`);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
            users = users.map(user => ({
                ...user,
                socketIds: user.socketIds.filter(sId => sId !== socket.id)
            })).filter(user => user.socketIds.length > 0);
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
