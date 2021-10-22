require('dotenv').config()
const jwt=require('jsonwebtoken');


exports.getResponseMessage=(statusCode,message)=>{
    return {
        statusCode,
        message
    }
}