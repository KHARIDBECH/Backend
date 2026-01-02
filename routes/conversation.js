import express from 'express';
import { createConvo, getConvo, findConvo, getUnreadCount, markAsRead } from '../controller/chat.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import validate from '../middleware/validate.js';
import { createConvoSchema, userIdParamSchema } from '../validations/chat.validation.js';

const router = express.Router();

router.post('/', firebaseAuth, validate(createConvoSchema), createConvo);
router.get('/find', firebaseAuth, findConvo);
router.get('/unread/count', firebaseAuth, getUnreadCount);
router.patch('/read/:conversationId', firebaseAuth, markAsRead);
router.get('/:userId', firebaseAuth, validate(userIdParamSchema, 'params'), getConvo);

export default router;