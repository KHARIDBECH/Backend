import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

const URI=process.env.MONGO_URI;

export const mongoConnect=()=>{
    mongoose.connect(URI,{useFindAndModify:false,useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>{
        console.log('Successfully connected to DB');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas!');
        console.error(error);
      });
}

export const mongoDisConnect=()=>{
    mongoose.disconnect()
    .then(()=>{
        console.log('DB disconnected');
    })
    .catch((err)=>{
        console.log(`Error :: ${err}`);
    })
}