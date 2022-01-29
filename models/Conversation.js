const mongoose = require('mongoose');
// const uniqueValidator = require('mongoose-unique-validator');

const ConversationSchema = mongoose.Schema({
   members:{
       type:Array,
   },
   
},{timestamps:true});


// productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Conversation',ConversationSchema); 
	