import mongoose from 'mongoose';
// import uniqueValidator from 'mongoose-unique-validator';

const MessageSchema = mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    }
}, { timestamps: true });


// productSchema.plugin(uniqueValidator);

export default mongoose.model('Message', MessageSchema);
