import User from '../models/user.js';
import Ad from '../models/product.js';
import Favorite from '../models/favorite.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { StatusCodes } from 'http-status-codes';

export const createUser = async (userData, firebaseUser) => {
    const { firstName, lastName, gender, address, profilePic } = userData;
    const { uid: firebaseUid, email, firebase } = firebaseUser;
    const authType = firebase.sign_in_provider;

    const existingUser = await User.findOne({
        $or: [{ email }, { firebaseUid }]
    });

    if (existingUser) {
        throw new ErrorResponse('User with this email or Firebase UID already exists', StatusCodes.BAD_REQUEST);
    }

    return await User.create({
        firstName,
        lastName,
        email,
        firebaseUid,
        authType,
        gender,
        address,
        profilePic: profilePic || ''
    });
};

export const updateProfile = async (userId, updateData) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
    }

    const fieldsToUpdate = ['firstName', 'lastName', 'gender', 'address', 'profilePic'];
    fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
            user[field] = updateData[field];
        }
    });

    return await user.save();
};

export const getUserById = async (userId, fields = '') => {
    const user = await User.findById(userId).select(fields);
    if (!user) {
        throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
    }
    return user;
};

export const getUserAds = async (userId, query) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const ads = await Ad.find({ postedBy: userId })
        .skip(skip)
        .limit(limit)
        .select('title price images postedAt')
        .sort('-postedAt');

    const totalAds = await Ad.countDocuments({ postedBy: userId });

    return {
        ads,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalAds / limit),
            totalAds
        }
    };
};

export const toggleFavorite = async (userId, productId) => {
    const ad = await Ad.findById(productId);
    if (!ad) {
        throw new ErrorResponse('Product not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is favoriting their own ad
    if (ad.postedBy.toString() === userId.toString()) {
        throw new ErrorResponse('You cannot favorite your own listing', StatusCodes.BAD_REQUEST);
    }

    const favorite = await Favorite.findOne({ user: userId, product: productId });

    if (favorite) {
        await favorite.deleteOne();
        return { isFavorite: false };
    } else {
        await Favorite.create({ user: userId, product: productId });
        return { isFavorite: true };
    }
};

export const getFavorites = async (userId) => {
    const favorites = await Favorite.find({ user: userId })
        .populate({
            path: 'product',
            select: 'title price images location condition createdAt postedBy',
            populate: {
                path: 'postedBy',
                select: 'firstName lastName'
            }
        })
        .sort('-createdAt');

    // Filter out favorites where the product might have been deleted but the favorite record remained
    return favorites.filter(fav => fav.product).map(fav => fav.product);
};

export const getUserFavoriteIds = async (userId) => {
    const favorites = await Favorite.find({ user: userId }).select('product');
    return favorites.map(fav => fav.product.toString());
};
