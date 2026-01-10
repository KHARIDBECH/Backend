import express from 'express';
import { upload } from '../middleware/multer.js';
import { createProduct, getProduct, getProductDetail, getAllCategories, deleteProduct, updateProduct, updateProductStatus } from '../controller/product.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import optionalFirebaseAuth from '../middleware/optionalFirebaseAuth.js';
import validate from '../middleware/validate.js';
import { createProductSchema, productQuerySchema, itemIdParamSchema, categoryParamSchema, productIdParamSchema, updateProductSchema, updateStatusSchema } from '../validations/product.validation.js';

const router = express.Router();

// Custom middleware to parse location if it's a string (since it's multipart)
const parseJsonBody = (req, res, next) => {
    if (typeof req.body.location === 'string') {
        try {
            req.body.location = JSON.parse(req.body.location);
        } catch (e) {
            // Let Joi handle the validation error
        }
    }
    // Also parse imagesToRemove if it's a string
    if (typeof req.body.imagesToRemove === 'string') {
        try {
            req.body.imagesToRemove = JSON.parse(req.body.imagesToRemove);
        } catch (e) {
            // Let Joi handle the validation error
        }
    }
    next();
};

router.post('/', firebaseAuth, upload.array('images', 6), parseJsonBody, validate(createProductSchema), createProduct);
router.get('/', optionalFirebaseAuth, validate(productQuerySchema, 'query'), getProduct);
router.get('/itemdetail/:itemid', validate(itemIdParamSchema, 'params'), getProductDetail);
router.get('/category/:category', validate(categoryParamSchema, 'params'), getAllCategories);

// Edit product (with optional new images)
router.put('/:id', firebaseAuth, upload.array('images', 6), parseJsonBody, validate(productIdParamSchema, 'params'), validate(updateProductSchema), updateProduct);

// Update product status only (mark as sold, etc.)
router.patch('/:id/status', firebaseAuth, validate(productIdParamSchema, 'params'), validate(updateStatusSchema), updateProductStatus);

router.delete('/:id', firebaseAuth, validate(productIdParamSchema, 'params'), deleteProduct);

export default router;
