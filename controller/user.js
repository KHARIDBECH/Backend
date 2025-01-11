const bcrypt = require('bcrypt');
const User = require('../models/User');
const Product = require('../models/Product');
const logger = require('../utils/logger');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();
const apiUtils = require('../utils/apiUtils');
const globalConstant = require('../utils/globalConstant');

exports.signup = async (req, res) => {
    logger.debug('Inside signup request');

    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            logger.error('Validation error: Missing required fields');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'Missing required fields'));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.error('User already exists');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'User already exists'));
        }

        logger.debug('No user with given email detected, creating new user');
        const hashedPassword = await bcrypt.hash(password, globalConstant.SALT_ROUNDS);
        const user = new User({ firstName, lastName, email, password: hashedPassword });

        await user.save();
        logger.info('User created successfully');
        return res.status(StatusCodes.CREATED).json(apiUtils.getResponseMessage(StatusCodes.CREATED, 'User created successfully'));
    } catch (error) {
        logger.error(`Signup error: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
};

exports.signin = async (req, res) => {
    logger.debug('Inside signin request');

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logger.error('Validation error: Missing email or password');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'Missing email or password'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            logger.error('User not found');
            return res.status(StatusCodes.UNAUTHORIZED).json(apiUtils.getResponseMessage(StatusCodes.UNAUTHORIZED, 'User not found'));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.error('Incorrect password');
            return res.status(StatusCodes.UNAUTHORIZED).json(apiUtils.getResponseMessage(StatusCodes.UNAUTHORIZED, 'Incorrect password'));
        }

        logger.info('Password matched, generating token');
        const token = apiUtils.generateAccessToken({ userId: user._id }, process.env.TOKEN_SECRET);

        const loginResponse = apiUtils.getResponseMessage(StatusCodes.OK, 'Logged in successfully');
        loginResponse.token = token;
        loginResponse.firstName = user.firstName;
        loginResponse.userId = user._id;

        return res.status(StatusCodes.OK).json(loginResponse);
    } catch (error) {
        logger.error(`Signin error: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
};

exports.verify = async (req, res) => {
    logger.debug('Inside verify user API');

    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            logger.error('Authorization header missing');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'Authorization header missing'));
        }

        const token = authHeader.split(' ')[1];
        const verifiedData = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);

        logger.info('Token verified successfully');
        return res.status(StatusCodes.OK).json(verifiedData);
    } catch (error) {
        logger.error(`Token verification error: ${error.message}`);
        return res.status(StatusCodes.UNAUTHORIZED).json(apiUtils.getResponseMessage(StatusCodes.UNAUTHORIZED, 'Invalid or expired token'));
    }
};

exports.getUser = async (req, res) => {
    logger.debug('Inside getUser API');

    try {
        const { friendId } = req.params;

        if (!friendId) {
            logger.error('Validation error: Missing friendId');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'Missing userId'));
        }

        const user = await User.findOne({ _id: friendId }, { firstName: 1, lastName: 1, email: 1 });
        console.log(user)
        if (!user) {
            logger.error('User not found');
            return res.status(StatusCodes.NOT_FOUND).json(apiUtils.getResponseMessage(StatusCodes.NOT_FOUND, 'User not found'));
        }

        logger.info('User fetched successfully');
        return res.status(StatusCodes.OK).json(user);
    } catch (error) {
        logger.error(`Get user error: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
};

exports.getAdsByUserId = async (req, res) => {
    logger.debug('Inside getAdsByUserId API');

    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        if (!userId) {
            logger.error('Validation error: Missing userId');
            return res.status(StatusCodes.BAD_REQUEST).json(apiUtils.getResponseMessage(StatusCodes.BAD_REQUEST, 'Missing userId'));
        }

        const ads = await Product.find({ postedBy: userId })
            .skip(skip)
            .limit(limit)
            .select('title price images postedDate');

        const totalAds = await Product.countDocuments({ postedBy: userId });
        const totalPages = Math.ceil(totalAds / limit);

        logger.info('Ads fetched successfully');
        return res.status(StatusCodes.OK).json({
            ads,
            pagination: {
                currentPage: page,
                totalPages,
                totalAds,
            },
        });
    } catch (error) {
        logger.error(`Get ads error: ${error.message}`);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(apiUtils.getResponseMessage(StatusCodes.INTERNAL_SERVER_ERROR, error.message));
    }
};
