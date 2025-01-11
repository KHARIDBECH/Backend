import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const userSchema = mongoose.Schema({
    firstName:{
      type: 'string',
      required: true
    },
    lastName:{
     type: 'string',
     required: true
    },
    email: {
        type: 'string',
        required: true,
        unique: true
    },
    password: {
        type: 'string',
        required: true
    }
});


userSchema.plugin(uniqueValidator);

export default mongoose.model('User',userSchema);