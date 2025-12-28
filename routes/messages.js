import express from 'express';
import { addMessage, getMessage } from '../controller/chat.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
const router = express.Router();

router.post('/', firebaseAuth, addMessage);
router.get('/:conversationId', firebaseAuth, getMessage);

export default router;