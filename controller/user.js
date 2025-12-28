import dotenv from 'dotenv';
import User from '../models/user.js';
import Ad from '../models/product.js';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

dotenv.config();

// @desc    Register a new user
// @route   POST /api/users/signup
// @access  Public
export const signup = asyncHandler(async (req, res, next) => {
    logger.debug('Inside signup request');
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return next(new ErrorResponse('Please provide all required fields', StatusCodes.BAD_REQUEST));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorResponse('User already exists', StatusCodes.BAD_REQUEST));
    }

    const user = await User.create({ firstName, lastName, email, password });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'User created successfully'
    });
});

// @desc    Login user
// @route   POST /api/users/signin
// @access  Public
export const signin = asyncHandler(async (req, res, next) => {
    logger.debug('Inside signin request');
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED));
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
        return next(new ErrorResponse('Invalid credentials', StatusCodes.UNAUTHORIZED));
    }

    const token = user.getSignedJwtToken();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged in successfully',
        token,
        userId: user._id,
        firstName: user.firstName
    });
});

// @desc    Verify token (Legacy/Internal)
// @route   GET /api/users/verify
// @access  Public
export const verify = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new ErrorResponse('Authorization header missing or invalid', StatusCodes.BAD_REQUEST));
    }

    const token = authHeader.split(' ')[1];
    const verifiedData = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);

    res.status(StatusCodes.OK).json({
        success: true,
        data: verifiedData
    });
});

// @desc    Get public user info
// @route   GET /api/users/user/:friendId
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
    const { friendId } = req.params;

    const user = await User.findById(friendId, { firstName: 1, lastName: 1, email: 1 });

    if (!user) {
        return next(new ErrorResponse('User not found', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json(user);
});

// @desc    Get ads by user ID (paginated)
// @route   GET /api/users/user/items/:userId
// @access  Private
export const getAdsByUserId = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const ads = await Ad.find({ postedBy: userId })
        .skip(skip)
        .limit(limit)
        .select('title price images postedAt')
        .sort('-postedAt');

    const totalAds = await Ad.countDocuments({ postedBy: userId });
    const totalPages = Math.ceil(totalAds / limit);

    res.status(StatusCodes.OK).json({
        success: true,
        ads,
        pagination: {
            currentPage: page,
            totalPages,
            totalAds,
        },
    });
});
