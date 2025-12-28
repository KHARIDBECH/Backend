
import express from 'express';
import { upload } from '../middleware/multer.js';
import { createProduct, getProduct, getProductDetail, getAllCategories, deleteProduct } from '../controller/product.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import optionalFirebaseAuth from '../middleware/optionalFirebaseAuth.js';

const router = express.Router();

router.post('/', firebaseAuth, upload.array('images', 6), createProduct);
router.get('/', optionalFirebaseAuth, getProduct);
router.get('/itemdetail/:itemid', getProductDetail);
router.get('/:category', getAllCategories);
router.delete('/:id', firebaseAuth, deleteProduct);
export default router;
