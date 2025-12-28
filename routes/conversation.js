import express from 'express';
import { createConvo, getConvo } from '../controller/chat.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
const router = express.Router();


router.post('/', firebaseAuth, createConvo);
router.get('/:userId', firebaseAuth, getConvo);

export default router;