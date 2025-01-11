const express = require('express');
const router = express.Router();
const verify_login_token = require('../middleware/verify_login_token');
const userCtrl = require('../controller/user');

router.post('/signup', userCtrl.signup);
router.post('/signin', userCtrl.signin);
router.get('/verifyjwt', userCtrl.verify);
// router.get('/user',userCtrl.getUser);
router.get('/user/items/:userId', verify_login_token, userCtrl.getAdsByUserId);
router.get('/user/:friendId', verify_login_token, userCtrl.getUser);
module.exports = router;