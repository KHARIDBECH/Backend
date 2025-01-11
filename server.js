
import http from 'http';
import app from './app.js';

const normalizePort = val => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};
const port = normalizePort(process.env.PORT || '5000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const server = http.createServer(app);
import { Server } from 'socket.io';
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true // Allow credentials if needed
  }
});

let users = [];

// Handle user connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Add user to the users array
  socket.on('addUser', (userId) => {
    if (!users.some(user => user.userId === userId)) {
      users.push({ userId, socketId: socket.id });
    }
    console.log('Connected users:', users);
  });

  // Handle incoming messages
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const receiver = users.find(user => user.userId === receiverId);
    if (receiver) {
      // Emit the message to the receiver's socket
      io.to(receiver.socketId).emit('getMessage', {
        senderId,
        text,
      });
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Remove user from the users array
    users = users.filter(user => user.socketId !== socket.id);
  });
});

server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

server.listen(port);
