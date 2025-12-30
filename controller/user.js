import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../middleware/asyncHandler.js';
import * as userService from '../services/user.service.js';

// @desc    Register a new user with Firebase UID
// @route   POST /api/users/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    const user = await userService.createUser(req.body, req.firebaseUser);

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
    const user = await userService.updateProfile(req.user._id, req.body);

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
    const user = await userService.getUserById(req.params.friendId, 'firstName lastName email profilePic');
    res.status(StatusCodes.OK).json(user);
});

// @desc    Get ads by user ID (paginated)
// @route   GET /api/users/my-listing
// @access  Private
export const getAdsByUserId = asyncHandler(async (req, res, next) => {
    const result = await userService.getUserAds(req.user._id, req.query);

    res.status(StatusCodes.OK).json({
        success: true,
        ...result
    });
});
