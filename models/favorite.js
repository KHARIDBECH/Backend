import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ad',
        required: true
    }
}, {
    timestamps: true
});

// Unique index to prevent a user from favoriting the same product multiple times
FavoriteSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model('Favorite', FavoriteSchema);
