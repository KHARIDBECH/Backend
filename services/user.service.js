import * as userRepository from '../repositories/user.repository.js';
import * as productRepository from '../repositories/product.repository.js';
import * as favoriteRepository from '../repositories/favorite.repository.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { StatusCodes } from 'http-status-codes';

export const createUser = async (userData, firebaseUser) => {
    const { firstName, lastName, gender, address, profilePic } = userData;
    const { uid: firebaseUid, email, firebase } = firebaseUser;
    const authType = firebase.sign_in_provider;

    const existingUser = await userRepository.findByEmailOrFirebaseUid(email, firebaseUid);

    if (existingUser) {
        throw new ErrorResponse('User with this email or Firebase UID already exists', StatusCodes.BAD_REQUEST);
    }

    return await userRepository.create({
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
    const user = await userRepository.findById(userId);

    if (!user) {
        throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
    }

    const fieldsToUpdate = ['firstName', 'lastName', 'gender', 'address', 'profilePic'];
    const updateObj = {};
    fieldsToUpdate.forEach(field => {
        if (updateData[field] !== undefined) {
            updateObj[field] = updateData[field];
        }
    });

    return await userRepository.updateById(userId, updateObj);
};

export const getUserById = async (userId, fields = '') => {
    const user = await userRepository.findById(userId, fields);
    if (!user) {
        throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
    }
    return user;
};

export const getUserAds = async (userId, query) => {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const ads = await productRepository.findByUserId(
        userId,
        skip,
        limit,
        'title price images createdAt status',
        { createdAt: -1 }
    );

    const totalAds = await productRepository.countByUserId(userId);

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
    const ad = await productRepository.findById(productId);
    if (!ad) {
        throw new ErrorResponse('Product not found', StatusCodes.NOT_FOUND);
    }

    // Check if user is favoriting their own ad
    if (ad.postedBy.toString() === userId.toString()) {
        throw new ErrorResponse('You cannot favorite your own listing', StatusCodes.BAD_REQUEST);
    }

    const favorite = await favoriteRepository.findOne({ user: userId, product: productId });

    if (favorite) {
        await favoriteRepository.deleteOne({ _id: favorite._id });
        return { isFavorite: false };
    } else {
        await favoriteRepository.create({ user: userId, product: productId });
        return { isFavorite: true };
    }
};

export const getFavorites = async (userId) => {
    const favorites = await favoriteRepository.findByUserIdPopulated(
        userId,
        'product',
        'title price images location condition createdAt postedBy',
        {
            path: 'postedBy',
            select: 'firstName lastName'
        }
    );

    // Filter out favorites where the product might have been deleted but the favorite record remained
    return favorites.filter(fav => fav.product).map(fav => fav.product);
};

export const getUserFavoriteIds = async (userId) => {
    const favorites = await favoriteRepository.findByUserId(userId, 'product');
    return favorites.map(fav => fav.product.toString());
};
