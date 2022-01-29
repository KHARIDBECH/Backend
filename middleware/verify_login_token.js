const globalConstant = require("../utils/globalConstant")
const apiUtils=require('../utils/apiUtils');
const HttpStatus=require('http-status-codes');
const User=require('../models/user');
const logger = require("../utils/logger");
require('dotenv').config()


const verify_login_token=(req,res,next)=>{
    logger.debug('inside verify User for login middleware')
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1];
    apiUtils.verifyAccessToken(token,process.env.TOKEN_SECRET)
    .then((payload)=>{
        logger.debug('token verified, looking for user')
        return User.findById(payload.userId)
    })

    .then((user)=>{
    if(!user){
        return res.status(401).json({error:new Error('User doesnt exist')})
    }
    logger.debug('user found');
    req.user=user;
    next();
    })
    .catch((err)=>{
        logger.debug(err.message)
        res.status(HttpStatus.UNAUTHORIZED).json({error:new Error('Unauthorized')})
    })
}

module.exports = verify_login_token;