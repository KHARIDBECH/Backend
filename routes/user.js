import express from 'express';
import verify_login_token from '../middleware/verify_login_token.js';
import { signup, signin, verify, getAdsByUserId, getUser } from '../controller/user.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verifyjwt', verify);
// router.get('/user',userCtrl.getUser);
router.get('/user/items/:userId', verify_login_token, getAdsByUserId);
router.get('/user/:friendId', verify_login_token, getUser);
export default router;