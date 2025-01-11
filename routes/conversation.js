import express from 'express';
import { createConvo, getConvo, getMessage } from '../controller/chat.js';
const router = express.Router();


router.post('/',createConvo);
router.get('/:userId',getConvo);

export default router;