import Ad from '../models/product.js';
import { s3 } from '../middleware/multer.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import ErrorResponse from '../utils/ErrorResponse.js';
import { UNDERSCOREID } from '../utils/globalConstant.js';
import dotenv from 'dotenv';

dotenv.config();

export const createProduct = async (productData, files, userId) => {
    if (!files || files.length === 0) {
        throw new ErrorResponse('No image files were uploaded.', 400);
    }

    const images = files.map(file => ({
        filename: file.key,
        url: file.location
    })).filter(img => img.url);

    if (images.length === 0) {
        throw new ErrorResponse('Failed to obtain image URLs from storage.', 500);
    }

    const product = new Ad({
        ...productData,
        postedBy: userId,
        images
    });

    return await product.save();
};

export const getProducts = async (query) => {
    let products = [];
    const { city, state } = query;

    // 1. Try fetching by City if provided
    if (city) {
        products = await Ad.find({
            'location.city': { $regex: city, $options: 'i' }
        }).sort({ postedAt: -1 });
    }

    // 2. Fallback to State if city search yielded no results
    if (products.length === 0 && state) {
        products = await Ad.find({
            'location.state': { $regex: state, $options: 'i' }
        }).sort({ postedAt: -1 });
    }

    // 3. Default: fetch all if no city/state filter or both found nothing
    if (products.length === 0 && !city && !state) {
        products = await Ad.find({}).sort({ postedAt: -1 });
    }

    if (!products.length) {
        throw new ErrorResponse('No products available.', 404);
    }

    return products;
};

export const getProductById = async (productId) => {
    const product = await Ad.findById(productId).populate('postedBy', 'firstName lastName');
    if (!product) {
        throw new ErrorResponse(`Product not found with id of ${productId}`, 404);
    }
    return product;
};

export const getProductsByCategory = async (category) => {
    return await Ad.find({
        category: { $regex: category, $options: 'i' }
    }).sort({ postedAt: -1 });
};

export const deleteProduct = async (productId, userId) => {
    const ad = await Ad.findById(productId);

    if (!ad) {
        throw new ErrorResponse(`Ad not found with id of ${productId}`, 404);
    }

    // Check if the ad belongs to the authenticated user
    if (ad.postedBy.toString() !== userId.toString()) {
        throw new ErrorResponse('Not authorized to delete this ad', 403);
    }

    // Delete images from S3
    const deletePromises = ad.images.map(image => {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: image.filename,
        });
        return s3.send(command);
    });

    await Promise.all(deletePromises);
    await ad.deleteOne();

    return true;
};
