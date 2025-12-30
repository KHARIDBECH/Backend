import express from 'express';
import { createConvo, getConvo } from '../controller/chat.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import validate from '../middleware/validate.js';
import { createConvoSchema, userIdParamSchema } from '../validations/chat.validation.js';

const router = express.Router();

router.post('/', firebaseAuth, validate(createConvoSchema), createConvo);
router.get('/:userId', firebaseAuth, validate(userIdParamSchema, 'params'), getConvo);

export default router;