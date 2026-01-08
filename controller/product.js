import asyncHandler from '../middleware/asyncHandler.js';
import * as productService from '../services/product.service.js';
import { UNDERSCOREID } from '../utils/globalConstant.js';

// @desc    Create a new product
// @route   POST /api/product
// @access  Private
export const createProduct = asyncHandler(async (req, res, next) => {
    const product = await productService.createProduct(req.body, req.files, req.user[UNDERSCOREID]);

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
    const products = await productService.getProducts(req.query);

    res.status(200).json({
        success: true,
        message: 'Products fetched successfully',
        count: products.length,
        data: products
    });
});

// @desc    Get single product detail
// @route   GET /api/product/itemdetail/:itemid
// @access  Public
export const getProductDetail = asyncHandler(async (req, res, next) => {
    const product = await productService.getProductById(req.params.itemid);

    res.status(200).json({
        success: true,
        message: 'Product detail fetched successfully',
        data: product
    });
});

// @desc    Get products by category
// @route   GET /api/product/category/:category
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
    const products = await productService.getProductsByCategory(req.params.category);

    res.status(200).json({
        success: true,
        message: `Products for category ${req.params.category} fetched successfully`,
        count: products.length,
        data: products
    });
});

// @desc    Delete product
// @route   DELETE /api/product/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res, next) => {
    await productService.deleteProduct(req.params.id, req.user[UNDERSCOREID]);

    res.status(200).json({
        success: true,
        message: 'Ad deleted successfully',
        data: {}
    });
});
