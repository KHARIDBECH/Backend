
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const productCtrl = require('../controller/product');
const Ad = require('../models/product');
const verify_login_token = require('../middleware/verify_login_token');

router.post('/ad',verify_login_token,upload.array('images',6),productCtrl.createProduct);
router.get('/ad',productCtrl.getProduct);
router.get('/itemdetail/:itemid',productCtrl.getProductDetail);
router.get('/:category',productCtrl.getAllCategories);
module.exports = router;
