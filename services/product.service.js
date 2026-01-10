import * as productRepository from '../repositories/product.repository.js';
import { s3 } from '../middleware/multer.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import ErrorResponse from '../utils/ErrorResponse.js';
import dotenv from 'dotenv';
import { envConfig } from '../config/env.config.js';

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

    return await productRepository.create({
        ...productData,
        postedBy: userId,
        images
    });
};

export const getProducts = async (query) => {
    const { city, state, search, minPrice, maxPrice } = query;

    // Build the query object
    let queryObj = {
        status: 'Active' // Only show active products by default
    };

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

    // 3. Price Range Filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
        queryObj.price = {};
        if (minPrice !== undefined) {
            queryObj.price.$gte = Number(minPrice);
        }
        if (maxPrice !== undefined) {
            queryObj.price.$lte = Number(maxPrice);
        }
    }

    // 4. Fetch Data
    return await productRepository.find(queryObj);
};

export const getProductById = async (productIdOrSlug) => {
    let product;

    // Check if input is a valid MongoDB ID
    if (productIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        product = await productRepository.findByIdPopulated(productIdOrSlug, 'postedBy', 'firstName lastName');
    }

    // Fallback to searching by productUrl
    if (!product) {
        product = await productRepository.findOnePopulated({ slug: productIdOrSlug }, 'postedBy', 'firstName lastName');
    }

    if (!product) {
        throw new ErrorResponse(`Product not found with id or slug: ${productIdOrSlug}`, 404);
    }
    return product;
};

export const getProductsByCategory = async (category) => {
    return await productRepository.find({
        category: { $regex: category, $options: 'i' },
        status: 'Active' // Only show active products
    });
};

// Update product details (edit ad)
export const updateProduct = async (productId, updateData, files, userId) => {
    const ad = await productRepository.findById(productId);

    if (!ad) {
        throw new ErrorResponse(`Ad not found with id of ${productId}`, 404);
    }

    // Check if the ad belongs to the authenticated user
    if (ad.postedBy.toString() !== userId.toString()) {
        throw new ErrorResponse('Not authorized to update this ad', 403);
    }

    // Handle image removal if specified
    if (updateData.imagesToRemove && updateData.imagesToRemove.length > 0) {
        // Delete images from S3
        const deletePromises = updateData.imagesToRemove.map(filename => {
            const command = new DeleteObjectCommand({
                Bucket: envConfig.aws.bucketName,
                Key: filename,
            });
            return s3.send(command).catch(err => console.error('Failed to delete S3 object:', err));
        });
        await Promise.all(deletePromises);

        // Remove from product images array
        ad.images = ad.images.filter(img => !updateData.imagesToRemove.includes(img.filename));
    }

    // Handle new image uploads
    if (files && files.length > 0) {
        const newImages = files.map(file => ({
            filename: file.key,
            url: file.location
        })).filter(img => img.url);

        ad.images = [...ad.images, ...newImages];
    }

    // Update other fields
    const { imagesToRemove, ...fieldsToUpdate } = updateData;
    Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] !== undefined) {
            ad[key] = fieldsToUpdate[key];
        }
    });

    return await ad.save();
};

// Update product status (mark as sold, etc.)
export const updateProductStatus = async (productId, status, userId) => {
    const ad = await productRepository.findById(productId);

    if (!ad) {
        throw new ErrorResponse(`Ad not found with id of ${productId}`, 404);
    }

    // Check if the ad belongs to the authenticated user
    if (ad.postedBy.toString() !== userId.toString()) {
        throw new ErrorResponse('Not authorized to update this ad status', 403);
    }

    ad.status = status;
    return await ad.save();
};

export const deleteProduct = async (productId, userId) => {
    const ad = await productRepository.findById(productId);

    if (!ad) {
        throw new ErrorResponse(`Ad not found with id of ${productId}`, 404);
    }

    // Check if the ad belongs to the authenticated user
    if (ad.postedBy.toString() !== userId.toString()) {
        throw new ErrorResponse('Not authorized to delete this ad', 403);
    }

    // Delete images from S3
    const deletePromises = ad.images.map(image => {
        if (image && image.filename) {
            const command = new DeleteObjectCommand({
                Bucket: envConfig.aws.bucketName,
                Key: image.filename,
            });
            return s3.send(command).catch(err => console.error('Failed to delete S3 object:', err));
        }
        return Promise.resolve();
    });

    await Promise.all(deletePromises);
    await productRepository.deleteById(productId);

    return true;
};
