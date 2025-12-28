import { Server } from 'socket.io';

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
        console.log('A user connected:', socket.id);

        socket.on('addUser', (userId) => {
            if (!users.some(user => user.userId === userId)) {
                users.push({ userId, socketId: socket.id });
            }
            console.log('Connected users:', users);
        });

        socket.on('sendMessage', ({ senderId, receiverId, text }) => {
            const receiver = users.find(user => user.userId === receiverId);
            if (receiver) {
                io.to(receiver.socketId).emit('getMessage', {
                    senderId,
                    text,
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);
            users = users.filter(user => user.socketId !== socket.id);
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
