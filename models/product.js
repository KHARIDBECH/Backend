const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const productSchema = mongoose.Schema({
    title:{
      type: 'string',
      required: true
    },
    description:{
     type: 'string',
     required: true
    },
    imageUrl: {
        type: 'string',
        required: true,
    },
    price: {
        type: 'string',
        required: true
    }
});


productSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Product',productSchema); 
	