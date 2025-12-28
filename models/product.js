import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';



const AdSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number']
    },
    category: {
        type: String,
        required: [true, 'Category is required']
    },
    images: {
        type: Array,
        required: true
    },
    location: {
        city: { type: String },
        state: { type: String },
        country: { type: String }
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });


AdSchema.plugin(uniqueValidator);

export default mongoose.model('Ad', AdSchema);
