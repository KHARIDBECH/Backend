const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const userCtrl = require('../controller/product');
const product = require('../models/product');



router.post('/postad',upload.array('images',6),userCtrl.createProduct);
router.get('/',userCtrl.getProduct);
router.get('/itemdetail/:itemid',userCtrl.getProductDetail);
module.exports = router;