
const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/multer');
const productCtrl = require('../controller/product');


const verify_login_token = require('../middleware/verify_login_token');

router.post('/', verify_login_token, upload.array('images', 6), productCtrl.createProduct);
router.get('/', verify_login_token, productCtrl.getProduct);
router.get('/itemdetail/:itemid', productCtrl.getProductDetail);
router.get('/:category', productCtrl.getAllCategories);
router.delete('/:id', verify_login_token, productCtrl.deleteProduct);
module.exports = router;
