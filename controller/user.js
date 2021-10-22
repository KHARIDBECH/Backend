const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')
const HttpStatus=require('http-status-codes');
const apiUtils=require('../utils/apiUtils');
const globalConstant=require('../utils/globalConstant');
exports.signup = (req, res) => {
   logger.debug('Inside signup request')
   User.findOne({email:req.body.email})
   .then((user)=>{
       if(user){
           logger.debug("Error!! user already registered please login")
           return res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(HttpStatus.BAD_REQUEST,'User already Exist'))
       }
       logger.debug('No user with given email detected creating new user')
       bcrypt.hash(req.body.password,globalConstant.SALT_ROUNDS)
        .then(hash => {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash
            });
      logger.debug('Password hashed')
      logger.debug('Saving user signup data')
            user.save().then(() => {
                logger.debug("User created succesfully")
                    res.status(HttpStatus.CREATED).json(apiUtils.getResponseMessage(HttpStatus.CREATED,'User created Succesfully'))
                    
                })
                .catch((err) => {
                    logger.debug("Sorryy... something went wrong")
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR,err.message))
                })

        })

   })
   .catch((err)=>{
    logger.debug("Sorryy... Error occured something went wrong")
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR,err))
   })
    
 
};

exports.signin = (req, res, next) => {
   User.findOne({email:req.body.email}).then((user)=>{
     if(!user){
         return res.status(401).json({error:new Error('User not found')})
     }
     bcrypt.compare(req.body.password,user.password)
     .then((valid)=>{
         if(!valid){
             return res.status(401).json({error:new Error('Incorrect password')})
         }
         const token = jwt.sign({userId:user._id},'RANDOM_TOKEN_SECRET',{expiresIn:'24h'})
         res.status(200).json({
             userId:user._id,
             token:token});
     })
     .catch((error)=>{res.status(500).json({error:error})})
   })
   .catch((error)=>{res.status(500).json({error:error})})
   

};