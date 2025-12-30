import User from '../models/user.js';
import Ad from '../models/product.js';
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
