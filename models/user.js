import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    firebaseUid: {
        type: String,
        required: [true, 'Firebase UID is required'],
        unique: true
    },
    authType: {
        type: String,
        required: [true, 'Authentication type is required'],
        enum: ['password', 'google.com', 'facebook.com', 'apple.com', 'phone']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    address: {
        type: String,
        default: ''
    },
    profilePic: {
        type: String,
        default: ''
    }
}, { timestamps: true });

userSchema.plugin(uniqueValidator);

export default mongoose.model('User', userSchema);