import Favorite from '../models/favorite.js';

export const findOne = async (query) => {
    return await Favorite.findOne(query);
};

export const create = async (favoriteData) => {
    return await Favorite.create(favoriteData);
};

export const deleteOne = async (query) => {
    return await Favorite.deleteOne(query);
};

export const findByUserIdPopulated = async (userId, path, select, subPopulate) => {
    let query = Favorite.find({ user: userId }).populate({
        path,
        select,
        populate: subPopulate
    });
    return await query.sort('-createdAt');
};

export const findByUserId = async (userId, select) => {
    return await Favorite.find({ user: userId }).select(select);
};
