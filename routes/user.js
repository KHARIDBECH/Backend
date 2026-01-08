import express from 'express';
import { register, getAdsByUserId, getUser, getMe, updateProfile, toggleFavorite, getFavorites } from '../controller/user.js';
import firebaseAuth from '../middleware/firebaseAuth.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';
import optionalFirebaseAuth from '../middleware/optionalFirebaseAuth.js';
import validate from '../middleware/validate.js';
import { registerSchema, updateProfileSchema, paginationSchema, mongoIdParamSchema } from '../validations/user.validation.js';

const router = express.Router();

router.post('/register', verifyFirebaseToken, validate(registerSchema), register);
router.put('/profile', firebaseAuth, validate(updateProfileSchema), updateProfile);
router.get('/me', optionalFirebaseAuth, getMe);
router.get('/my-listing', firebaseAuth, validate(paginationSchema, 'query'), getAdsByUserId);
router.get('/user/:friendId', firebaseAuth, validate(mongoIdParamSchema, 'params'), getUser);
router.post('/favorites/:productId', firebaseAuth, toggleFavorite);
router.get('/favorites', firebaseAuth, getFavorites);

export default router;