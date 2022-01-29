const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title:{
      type: 'string',
      required: true
    },
    description:{
     type: 'string',
     required: true
    },
    postedAt:{
        type: String,
        default: Date.now()
    },
    image:{
        type: Array,
        required: true
    },
    price: {
        type: 'string',
        required: true
    },
    iid:{
        type:'string',
        required:true,
    }
    
});


productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Product',productSchema); 
	