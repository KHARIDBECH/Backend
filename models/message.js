import mongoose from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

const MessageSchema = mongoose.Schema({
   conversationId:{
       type:String,
       required:true
   },
   senderId:{
       type:String ,
       required:true
   },
   text:{
       type:String,
       required:true
   }
   
},{timestamps:true});


// productSchema.plugin(uniqueValidator);

export default mongoose.model('Message',MessageSchema); 
	