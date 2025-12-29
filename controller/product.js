import Ad from '../models/product.js';
import { s3 } from '../middleware/multer.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import logger from '../utils/logger.js';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import { UNDERSCOREID } from '../utils/globalConstant.js';

// @desc    Create a new product
// @route   POST /api/product
// @access  Private
export const createProduct = asyncHandler(async (req, res, next) => {
    const { title, description, price, category, location } = req.body;

    if (!req.files || req.files.length === 0) {
        return next(new ErrorResponse('No image files were uploaded.', 400));
    }

    const images = req.files.map(file => ({
        filename: file.key,
        url: file.location
    })).filter(img => img.url);

    if (images.length === 0) {
        return next(new ErrorResponse('Failed to obtain image URLs from storage.', 500));
    }

    const newProduct = new Ad({
        title,
        description,
        price,
        category,
        location,
        postedBy: req.user[UNDERSCOREID],
        images
    });

    const product = await newProduct.save();

    res.status(201).json({
        success: true,
        message: 'Product created successfully!',
        data: product
    });
});

// @desc    Get all products (optionally excluding current user's)
// @route   GET /api/product
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
    const userId = req.user?.id;

    logger.info(userId
        ? `Fetching products not posted by user: ${userId}`
        : "Fetching all products for an unauthenticated user."
    );

    let products = [];

    // 1. Try fetching by City if provided
    if (req.query.city) {
        products = await Ad.find({
            'location.city': { $regex: req.query.city, $options: 'i' }
        }).sort({ postedAt: -1 });
    }

    // 2. Fallback to State if city search yielded no results
    if (products.length === 0 && req.query.state) {
        products = await Ad.find({
            'location.state': { $regex: req.query.state, $options: 'i' }
        }).sort({ postedAt: -1 });
    }

    // 3. Default: fetch all if no city/state filter or both found nothing
    if (products.length === 0 && !req.query.city && !req.query.state) {
        products = await Ad.find({}).sort({ postedAt: -1 });
    }

    if (!products.length) {
        return next(new ErrorResponse('No products available.', 404));
    }

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Get single product detail
// @route   GET /api/product/itemdetail/:itemid
// @access  Public
export const getProductDetail = asyncHandler(async (req, res, next) => {
    const product = await Ad.findById(req.params.itemid).populate('postedBy', 'firstName lastName');

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.itemid}`, 404));
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Get products by category
// @route   GET /api/product/category/:category
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
    const { category } = req.params;
    const products = await Ad.find({
        category: { $regex: category, $options: 'i' }
    }).sort({ postedAt: -1 });

    res.status(200).json({
        success: true,
        count: products.length,
        data: products
    });
});

// @desc    Delete product
// @route   DELETE /api/product/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res, next) => {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
        return next(new ErrorResponse(`Ad not found with id of ${req.params.id}`, 404));
    }

    // Check if the ad belongs to the authenticated user
    if (ad.postedBy.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to delete this ad', 403));
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

    res.status(200).json({
        success: true,
        message: 'Ad deleted successfully',
        data: {}
    });
});
