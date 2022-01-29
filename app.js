require("dotenv").config();
const path = require('path')

const express = require("express");
const { mongoConnect } = require("./utils/dbUtils");
const app = express();
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/messages");
const BodyParser = require("body-parser");
const cors = require("cors");
const swaggerRoute=require('./swagger/swagger');
app.use(cors());

  
// Static Middleware 
console.log(path.join(__dirname, '/public/images'))
app.use('/public', express.static(path.resolve('./public')));
// app.use(express.static(path.join(__dirname, '/public/images')));
app.use(express.json());
app.use('/developer',swaggerRoute);
app.use("/api/auth", userRoutes);
app.use("/api/stuff", productRoutes);
app.use("/api/chatConvo", conversationRoutes);
app.use("/api/chatMessages", messageRoutes);
mongoConnect(); //Mongo connection
module.exports = app;
