require('dotenv').config();
const mongoose=require('mongoose');
const URI=process.env.MONGO_URI;

exports.mongoConnect=()=>{
    mongoose.connect(URI,{useFindAndModify:false,useNewUrlParser:true,useUnifiedTopology:true})
    .then(()=>{
        console.log('Successfully connected to DB');
    })
    .catch((error) => {
        console.log('Unable to connect to MongoDB Atlas!');
        console.error(error);
      });
}

exports.mongoDisConnect=()=>{
    mongoose.disconnect()
    .then(()=>{
        console.log('DB disconnected');
    })
    .catch((err)=>{
        console.log(`Error :: ${err}`);
    })
}