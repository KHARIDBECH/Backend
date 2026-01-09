import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { mongoConnect } from './utils/dbUtils.js';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';
import conversationRoutes from './routes/conversation.js';
import messageRoutes from './routes/messages.js';
import errorHandler from './middleware/errorMiddleware.js';
import { envConfig } from './config/env.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Static Middleware 
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mount routes with Versioning
const apiV1 = "/api/v1";
app.use(`${apiV1}/users`, userRoutes);
app.use(`${apiV1}/product`, productRoutes);
app.use(`${apiV1}/chatConvo`, conversationRoutes);
app.use(`${apiV1}/chatMessages`, messageRoutes);

// Root route
app.get('/', (req, res) => {
  res.send(`Server running smoothly in ${envConfig.env} mode!`);
});

// Centralized Error Handler
app.use(errorHandler);

// Connect to Database
mongoConnect();

export default app;
