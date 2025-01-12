import dotenv from 'dotenv';
import path from 'path'; // Importing path module
import express from 'express'; // Importing express
import { mongoConnect } from './utils/dbUtils.js'; // Ensure to add .js extension
import userRoutes from './routes/user.js'; // Ensure to add .js extension
import productRoutes from './routes/product.js'; // Ensure to add .js extension
import conversationRoutes from './routes/conversation.js'; // Ensure to add .js extension
// import messageRoutes from './routes/messages.js'; // Ensure to add .js extension
import cors from 'cors'; // Importing cors


dotenv.config();
const app = express();
app.use(cors());

  
// Static Middleware 
// console.log(path.join(__dirname, '/public/images'))
app.use('/public', express.static(path.resolve('./public')));
// app.use(express.static(path.join(__dirname, '/public/images')));
app.get('/', (req, res) => {
    res.send('Server running smoothlyy!');
  });
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/chatConvo", conversationRoutes);
// app.use("/api/chatMessages", messageRoutes);
mongoConnect(); //Mongo connection
export default app;
