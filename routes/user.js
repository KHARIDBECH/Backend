import express from 'express';
import { register, getAdsByUserId, getUser, getMe, updateProfile } from '../controller/user.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';
import optionalFirebaseAuth from '../middleware/optionalFirebaseAuth.js';

const router = express.Router();

router.post('/register', verifyFirebaseToken, register);
router.put('/profile', firebaseAuth, updateProfile);
router.get('/me', optionalFirebaseAuth, getMe);
router.get('/my-listing', firebaseAuth, getAdsByUserId);
router.get('/user/:friendId', firebaseAuth, getUser);

export default router;