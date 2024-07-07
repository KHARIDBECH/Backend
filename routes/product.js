
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const productCtrl = require('../controller/product');
const verify_login_token = require('../middleware/verify_login_token');

// verify_login_token,
router.post('/ad',verify_login_token,upload.array('images',6),productCtrl.createProduct);

router.get('/ad',productCtrl.getProduct);
router.get('/itemdetail/:itemid',productCtrl.getProductDetail);
module.exports = router;