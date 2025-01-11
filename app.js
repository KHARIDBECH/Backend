require("dotenv").config();
const path = require('path')
const express = require("express");
const { mongoConnect } = require("./utils/dbUtils");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/messages");
const cors = require("cors");
const swaggerRoute=require('./swagger/swagger');


const app = express();
app.use(cors());

  
// Static Middleware 
console.log(path.join(__dirname, '/public/images'))
app.use('/public', express.static(path.resolve('./public')));
// app.use(express.static(path.join(__dirname, '/public/images')));
app.get('/', (req, res) => {
    res.send('Server running smoothlyy!');
  });
app.use(express.json());
app.use('/developer',swaggerRoute);
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/chatConvo", conversationRoutes);
app.use("/api/chatMessages", messageRoutes);
mongoConnect(); //Mongo connection
module.exports = app;
