import dotenv from 'dotenv';
import User from '../models/user.js';
import Ad from '../models/product.js';
import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';

dotenv.config();

// @desc    Register a new user with Firebase UID
// @route   POST /api/users/signup
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    console.log('--- REGISTER API CALLED ---');
    logger.debug('Inside register request');
    const { firstName, lastName, gender, address, profilePic } = req.body;
    const { uid: firebaseUid, email, firebase } = req.firebaseUser;
    const authType = firebase.sign_in_provider;

    if (!firstName || !lastName) {
        return next(new ErrorResponse('Please provide first and last name', StatusCodes.BAD_REQUEST));
    }

    const existingUser = await User.findOne({
        $or: [{ email }, { firebaseUid }]
    });

    if (existingUser) {
        return next(new ErrorResponse('User with this email or Firebase UID already exists', StatusCodes.BAD_REQUEST));
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        firebaseUid,
        authType,
        gender,
        address,
        profilePic: profilePic || ''
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'User registered in database successfully',
        data: user
    });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, gender, address, profilePic } = req.body;

    // req.user is populated by firebaseAuth middleware
    let user = await User.findById(req.user._id);

    if (!user) {
        return next(new ErrorResponse('User not found', StatusCodes.NOT_FOUND));
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (address !== undefined) user.address = address;
    if (profilePic) user.profilePic = profilePic;

    await user.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
    });
});

// @desc    Get current user profile (using Firebase Auth)
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    res.status(StatusCodes.OK).json({
        success: true,
        data: req.user
    });
});

// @desc    Get public user info
// @route   GET /api/users/user/:friendId
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
    const { friendId } = req.params;

    const user = await User.findById(friendId, { firstName: 1, lastName: 1, email: 1, profilePic: 1 });

    if (!user) {
        return next(new ErrorResponse('User not found', StatusCodes.NOT_FOUND));
    }

    res.status(StatusCodes.OK).json(user);
});

// @desc    Get ads by user ID (paginated)
// @route   GET /api/users/user/items/:userId
// @access  Private
export const getAdsByUserId = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
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
