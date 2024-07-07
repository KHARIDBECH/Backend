const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// const productSchema = mongoose.Schema({
//     userId:{
//         type: mongoose.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     title:{
//       type: 'string',
//       required: true
//     },
//     description:{
//      type: 'string',
//      required: true
//     },
//     postedAt:{
//         type: String,
//         default: Date.now()
//     },
//     image:{
//         type: Array,
//         required: true
//     },
//     price: {
//         type: 'string',
//         required: true
//     },
//     iid:{
//         type:'string',
//         required:true,
//     }

// });



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
    postedDate: {
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

module.exports = mongoose.model('Ad', AdSchema);
