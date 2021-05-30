const express = require('express');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/user')
const productRoutes = require('./routes/product')
const BodyParser = require('body-parser')
const cors = require('cors')
//
app.use(cors())
mongoose.connect('mongodb+srv://Khan:oPtvLQLycrPJvzxm@cluster0.jrv50.mongodb.net/KharidBech?retryWrites=true&w=majority',{ useNewUrlParser: true , useUnifiedTopology: true })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.log('Unable to connect to MongoDB Atlas!');
    console.error(error);
  });

app.use(express.json());

  
app.use('/api/auth',userRoutes);
app.use('/api/stuff',productRoutes);

//
module.exports = app;