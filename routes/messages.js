const express = require('express');
const router = express.Router();
const chatCtrl = require('../controller/chat');
router.post('/',chatCtrl.addMessage);
router.get('/:conversationId',chatCtrl.getMessage);

module.exports = router;