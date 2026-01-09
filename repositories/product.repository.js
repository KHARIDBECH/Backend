import Ad from '../models/product.js';

export const create = async (productData) => {
    const product = new Ad(productData);
    return await product.save();
};

export const find = async (queryObj, sort = { createdAt: -1 }) => {
    return await Ad.find(queryObj).sort(sort);
};

export const findById = async (productId) => {
    return await Ad.findById(productId);
};

export const findByIdPopulated = async (productId, path, select) => {
    return await Ad.findById(productId).populate(path, select);
};

export const findOnePopulated = async (query, path, select) => {
    return await Ad.findOne(query).populate(path, select);
};

export const findByUserId = async (userId, skip, limit, select, sort) => {
    return await Ad.find({ postedBy: userId })
        .skip(skip)
        .limit(limit)
        .select(select)
        .sort(sort);
};

export const countByUserId = async (userId) => {
    return await Ad.countDocuments({ postedBy: userId });
};

export const deleteById = async (productId) => {
    return await Ad.findByIdAndDelete(productId);
};
