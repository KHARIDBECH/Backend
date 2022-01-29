const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const MessageSchema = mongoose.Schema({
   conversationId:{
       type:String,
   },
   sender:{
       type:String
   },
   text:{
       type:String
   }
   
},{timestamps:true});


// productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Message',MessageSchema); 
	