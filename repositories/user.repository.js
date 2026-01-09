import User from '../models/user.js';

export const findByEmailOrFirebaseUid = async (email, firebaseUid) => {
    return await User.findOne({
        $or: [{ email }, { firebaseUid }]
    });
};

export const create = async (userData) => {
    return await User.create(userData);
};

export const findById = async (userId, fields = '') => {
    return await User.findById(userId).select(fields);
};

export const updateById = async (userId, updateData) => {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
};
