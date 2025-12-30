import express from 'express';
import { upload } from '../middleware/multer.js';
import { createProduct, getProduct, getProductDetail, getAllCategories, deleteProduct } from '../controller/product.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import optionalFirebaseAuth from '../middleware/optionalFirebaseAuth.js';
import validate from '../middleware/validate.js';
import { createProductSchema, productQuerySchema, itemIdParamSchema, categoryParamSchema, productIdParamSchema } from '../validations/product.validation.js';

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
    next();
};

router.post('/', firebaseAuth, upload.array('images', 6), parseJsonBody, validate(createProductSchema), createProduct);
router.get('/', optionalFirebaseAuth, validate(productQuerySchema, 'query'), getProduct);
router.get('/itemdetail/:itemid', validate(itemIdParamSchema, 'params'), getProductDetail);
router.get('/:category', validate(categoryParamSchema, 'params'), getAllCategories);
router.delete('/:id', firebaseAuth, validate(productIdParamSchema, 'params'), deleteProduct);

export default router;
