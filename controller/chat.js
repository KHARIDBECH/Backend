const Message= require('../models/Message');
const Conversation= require('../models/Conversation');
const globalConstant = require('../utils/globalConstant');

//Conversation start
exports.createConvo = async(req,res,next)=>{
const newConversation = new Conversation({
members: [req.body.senderId,req.body.recieverId],
});
try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
} catch (err) {
    res.status(500).json(err)
}
}

exports.getConvo = async(req,res,next)=>{
try {
    const conversation = await Conversation.find({
    members:{$in:[req.params.userId]},
    });
    res.status(200).json(conversation)
} catch (err) {
    res.status(500).json(err)
}
}


//Add Message routes logic
exports.addMessage = async(req,res)=>{

    const newMessage = new Message(req.body)
    try {
        const savedConversation = await newMessage.save();
        res.status(200).json(savedConversation);
    } catch (err) {
        res.status(500).json(err)
    }
}
//Get message routes logic for

exports.getMessage = async(req,res)=>{
try {
    const messages = await Message.find({conversationId: req.params.conversationId});
    res.status(200).json(messages)
} catch (err) {
    res.status(500).json(err);
}
}
