const express = require('express');
const router = express.Router();

const userCtrl = require('../controller/product');

router.post('/postad',userCtrl.createProduct);
router.get('/',userCtrl.getProduct);
module.exports = router;