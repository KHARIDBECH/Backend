import mongoose from 'mongoose';

const ConversationSchema = mongoose.Schema(
  {
    members: {
      type: Array,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Product model
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Conversation', ConversationSchema);
