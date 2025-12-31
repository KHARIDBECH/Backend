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
    const { city, state, search } = query;

    // Build the query object
    let queryObj = {};

    // 1. Text Search (checks title, description, category, subcategory)
    if (search) {
        const searchRegex = { $regex: search, $options: 'i' };
        queryObj.$or = [
            { title: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { subcategory: searchRegex }
        ];
    }

    // 2. Location Filtering
    if (city) {
        queryObj['location.city'] = { $regex: city, $options: 'i' };
    } else if (state) {
        // Only fallback to state if city is NOT provided
        queryObj['location.state'] = { $regex: state, $options: 'i' };
    }

    // 3. Fetch Data
    products = await Ad.find(queryObj).sort({ createdAt: -1 });

    return products;
};

export const getProductById = async (productIdOrSlug) => {
    let product;

    // Check if input is a valid MongoDB ID
    if (productIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Ad.findById(productIdOrSlug).populate('postedBy', 'firstName lastName');
    }

    // Fallback to searching by productUrl
    if (!product) {
        product = await Ad.findOne({ slug: productIdOrSlug }).populate('postedBy', 'firstName lastName');
    }

    if (!product) {
        throw new ErrorResponse(`Product not found with id or slug: ${productIdOrSlug}`, 404);
    }
    return product;
};

export const getProductsByCategory = async (category) => {
    return await Ad.find({
        category: { $regex: category, $options: 'i' }
    }).sort({ createdAt: -1 });
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
    // Delete images from S3
    const deletePromises = ad.images.map(image => {
        if (image && image.filename) {
            const command = new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: image.filename,
            });
            return s3.send(command).catch(err => console.error('Failed to delete S3 object:', err));
        }
        return Promise.resolve();
    });

    await Promise.all(deletePromises);
    await ad.deleteOne();

    return true;
};
