import asyncHandler from '../middleware/asyncHandler.js';
import * as productService from '../services/product.service.js';
import { UNDERSCOREID } from '../utils/globalConstant.js';
import { sendResponse } from '../utils/responseHandler.js';
import { StatusCodes } from 'http-status-codes';

// @desc    Create a new product
// @route   POST /api/product
// @access  Private
export const createProduct = asyncHandler(async (req, res, next) => {
    const product = await productService.createProduct(req.body, req.files, req.user[UNDERSCOREID]);
    return sendResponse(res, StatusCodes.CREATED, product, 'Product created successfully!');
});

// @desc    Get all products (optionally excluding current user's)
// @route   GET /api/product
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
    const products = await productService.getProducts(req.query);
    return sendResponse(res, StatusCodes.OK, products, 'Products fetched successfully');
});

// @desc    Get single product detail
// @route   GET /api/product/itemdetail/:itemid
// @access  Public
export const getProductDetail = asyncHandler(async (req, res, next) => {
    const product = await productService.getProductById(req.params.itemid);
    return sendResponse(res, StatusCodes.OK, product, 'Product detail fetched successfully');
});

// @desc    Get products by category
// @route   GET /api/product/category/:category
// @access  Public
export const getAllCategories = asyncHandler(async (req, res, next) => {
    const products = await productService.getProductsByCategory(req.params.category);
    return sendResponse(res, StatusCodes.OK, products, `Products for category ${req.params.category} fetched successfully`);
});

// @desc    Update product details
// @route   PUT /api/product/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res, next) => {
    const product = await productService.updateProduct(req.params.id, req.body, req.files, req.user[UNDERSCOREID]);
    return sendResponse(res, StatusCodes.OK, product, 'Ad updated successfully');
});

// @desc    Update product status (mark as sold, etc.)
// @route   PATCH /api/product/:id/status
// @access  Private
export const updateProductStatus = asyncHandler(async (req, res, next) => {
    const product = await productService.updateProductStatus(req.params.id, req.body.status, req.user[UNDERSCOREID]);
    return sendResponse(res, StatusCodes.OK, product, 'Ad status updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/product/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res, next) => {
    await productService.deleteProduct(req.params.id, req.user[UNDERSCOREID]);
    return sendResponse(res, StatusCodes.OK, {}, 'Ad deleted successfully');
});
