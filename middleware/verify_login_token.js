const globalConstant = require("../utils/globalConstant")
const apiUtils=require('../utils/apiUtils');
const {StatusCodes}=require('http-status-codes');
const User=require('../models/user');
const logger = require("../utils/logger");
require('dotenv').config()


const verify_login_token= async(req,res,next)=>{
    logger.debug('inside verify User for login middleware')
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try{
        const payload = await  apiUtils.verifyAccessToken(token,process.env.TOKEN_SECRET);
        console.log(payload)
        req.user = await User.findById({_id:payload.userId}).select('-password');
        next();
    }
    catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json(error);
    }
    
}

module.exports = verify_login_token;