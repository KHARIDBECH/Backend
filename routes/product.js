
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const userCtrl = require('../controller/product');
const product = require('../models/product');
const verify_login_token = require('../middleware/verify_login_token');

// verify_login_token,
router.post('/postad',verify_login_token,upload.array('images',6),userCtrl.createProduct);
router.get('/',userCtrl.getProduct);
router.get('/itemdetail/:itemid',userCtrl.getProductDetail);
module.exports = router;