const express = require('express');
const router = express.Router();

const userCtrl = require('../controller/user');

router.post('/signup',userCtrl.signup);
router.post('/signin',userCtrl.signin);
router.get('/verifyjwt',userCtrl.verify);
router.get('/user',userCtrl.getUser);

module.exports = router;