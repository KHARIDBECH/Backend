import express from 'express';
import { addMessage, getMessage } from '../controller/chat.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import validate from '../middleware/validate.js';
import { addMessageSchema, paginationSchema, conversationIdParamSchema } from '../validations/chat.validation.js';

const router = express.Router();

router.post('/', firebaseAuth, validate(addMessageSchema), addMessage);
router.get('/:conversationId',
    firebaseAuth,
    validate(conversationIdParamSchema, 'params'),
    validate(paginationSchema, 'query'),
    getMessage
);

export default router;