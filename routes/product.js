
import express from 'express';
import { upload } from '../middleware/multer.js';
import { createProduct, getProduct, getProductDetail, getAllCategories, deleteProduct } from '../controller/product.js';
import verify_login_token from '../middleware/verify_login_token.js';


const router = express.Router();

router.post('/', verify_login_token, upload.array('images', 6), createProduct);
router.get('/', verify_login_token, getProduct);
router.get('/itemdetail/:itemid', getProductDetail);
router.get('/:category', getAllCategories);
router.delete('/:id', verify_login_token, deleteProduct);
export default router;
