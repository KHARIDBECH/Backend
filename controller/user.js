import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../middleware/asyncHandler.js';
import * as userService from '../services/user.service.js';
import { sendResponse } from '../utils/responseHandler.js';

// @desc    Register a new user with Firebase UID
// @route   POST /api/users/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    const user = await userService.createUser(req.body, req.firebaseUser);
    return sendResponse(res, StatusCodes.CREATED, user, 'User registered in database successfully');
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    return sendResponse(res, StatusCodes.OK, user, 'Profile updated successfully');
});

// @desc    Get current user profile (using Firebase Auth)
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    const favoriteIds = await userService.getUserFavoriteIds(req.user._id);
    const data = {
        ...req.user.toObject(),
        favoriteIds
    };
    return sendResponse(res, StatusCodes.OK, data, 'User profile fetched');
});

// @desc    Get public user info
// @route   GET /api/users/user/:friendId
// @access  Private
export const getUser = asyncHandler(async (req, res, next) => {
    const user = await userService.getUserById(req.params.friendId, 'firstName lastName email profilePic');
    return sendResponse(res, StatusCodes.OK, user, 'User found');
});

// @desc    Get ads by user ID (paginated)
// @route   GET /api/users/my-listing
// @access  Private
export const getAdsByUserId = asyncHandler(async (req, res, next) => {
    const result = await userService.getUserAds(req.user._id, req.query);
    // Since result already contains ads and pagination, we just wrap it
    return sendResponse(res, StatusCodes.OK, result, 'User ads fetched successfully');
});

// @desc    Toggle product favorite
// @route   POST /api/users/favorites/:productId
// @access  Private
export const toggleFavorite = asyncHandler(async (req, res, next) => {
    const result = await userService.toggleFavorite(req.user._id, req.params.productId);
    return sendResponse(res, StatusCodes.OK, result, 'Favorite status toggled');
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
export const getFavorites = asyncHandler(async (req, res, next) => {
    const favorites = await userService.getFavorites(req.user._id);
    return sendResponse(res, StatusCodes.OK, favorites, 'Favorites fetched successfully');
});
