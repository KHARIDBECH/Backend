const bcrypt = require('bcrypt');
const User = require('../models/user');
const jwt = require('jsonwebtoken');


exports.signup = (req, res,next) => {
    console.log(req.body)
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: hash
            });
            user.save().then(() => {
                    res.status(201).json({
                        message: 'User Created succesfully!'
                    })
                })
                .catch((error) => {
                    res.status(500).json({
                        error: error
                    })
                })

        })
        .catch((error) => {res.status(500).json({error:error})})
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