const bcrypt = require('bcrypt');
const User = require('../models/user');
const Ad = require('../models/product');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger')
const HttpStatus = require('http-status-codes');
require('dotenv').config()
const apiUtils = require('../utils/apiUtils');
const globalConstant = require('../utils/globalConstant');
exports.signup = (req, res) => {
    logger.debug('Inside signup request')
    User.findOne({ email: req.body.email })
        .then((user) => {
            if (user) {
                logger.debug("Error!! user already registered please login")
                return res.status(HttpStatus.BAD_REQUEST).json(apiUtils.getResponseMessage(HttpStatus.BAD_REQUEST, 'User already Exist'))
            }
            logger.debug('No user with given email detected creating new user')
            bcrypt.hash(req.body.password, globalConstant.SALT_ROUNDS)
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
                        res.status(HttpStatus.CREATED).json(apiUtils.getResponseMessage(HttpStatus.CREATED, 'User created Succesfully'))

                    })
                        .catch((err) => {
                            logger.debug("Sorryy... something went wrong")
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR, err.message))
                        })

                })

        })
        .catch((err) => {
            logger.debug("Sorryy... Error occured something went wrong")
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR, err))
        })


};

exports.signin = (req, res, next) => {
    User.findOne({ email: req.body.email }).then((user) => {
        if (!user) {
            return res.status(401).json({ error: new Error('User not found') })
        }
        bcrypt.compare(req.body.password, user.password)
            .then((valid) => {
                if (!valid) {
                    return res.status(401).json({ error: new Error('Incorrect password') })
                }
                logger.debug('password matched, generating token')
                const token = apiUtils.generateAccessToken({ userId: user._id }, process.env.TOKEN_SECRET)
                const loginResponse = apiUtils.getResponseMessage(200, 'logged in successfully');
                loginResponse['token'] = token;
                loginResponse['firstName'] = user.firstName;
                loginResponse['userId'] = user._id;
                res.status(HttpStatus.OK).json(loginResponse);

            })
            .catch((error) => { res.status(500).json({ error: error }) })
    })
        .catch((error) => { res.status(500).json({ error: error }) })


};

exports.verify = (req, res) => {
    logger.debug('inside verify user api')
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ')
    const token = bearerToken[1];
    // console.log(req.user)
    apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET)
        .then((result) => {
            res.status(HttpStatus.OK).json(result);
        })
        .catch((err) => {
            res.status(HttpStatus.BAD_REQUEST).json({ error: new Error('Error occured') });
        })
}

exports.getUser = (req, res) => {
    const userId = req.query.userId;
    User.find({ _id: userId }, { firstName: 1, lastName: 1, email: 1, _id: 0 })
        .then((user) => {
            res.status(HttpStatus.OK).json(user);
        })
        .catch((err) => {
            res.status(HttpStatus.BAD_REQUEST)
        })
}


exports.getAdsByUserId = async (req, res) => {
    const { userId } = req.params;

    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = 5; // Number of ads per page
    const skip = (page - 1) * limit;
    console.log(userId)
    try {
        const ads = await Ad.find({ postedBy: userId })
            .skip(skip)
            .limit(limit)
            .select('title price images postedDate');

        const totalAds = await Ad.countDocuments({ postedBy: userId });
        const totalPages = Math.ceil(totalAds / limit);
        res.status(200).json({
            ads,
            pagination: {
              currentPage: page,
              totalPages,
              totalAds,
            },
          });
    } catch (error) {
        res.status(500).send(error);
    }
};