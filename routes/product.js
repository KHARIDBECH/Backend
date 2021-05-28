const express = require('express');
const router = express.Router();

const userCtrl = require('../controller/product');

router.post('/',userCtrl.createProduct);

module.exports = router;