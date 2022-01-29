const express = require('express');
const router = express.Router();
const chatCtrl = require('../controller/chat');


router.post('/',chatCtrl.createConvo);
router.get('/:userId',chatCtrl.getConvo);

module.exports = router;