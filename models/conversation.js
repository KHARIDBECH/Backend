import mongoose from 'mongoose';

const ConversationSchema = mongoose.Schema(
  {
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ad',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', ConversationSchema);
