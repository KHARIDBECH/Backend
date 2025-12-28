import admin from '../config/firebase.js';
import User from '../models/user.js';
import asyncHandler from './asyncHandler.js';
import logger from '../utils/logger.js';

const optionalFirebaseAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        const user = await User.findOne({ firebaseUid: uid });

        req.user = user || null;
        req.firebaseUser = decodedToken;
        next();
    } catch (error) {
        logger.warn('Optional Firebase token verification failed:', error.message);
        req.user = null;
        next();
    }
});

export default optionalFirebaseAuth;
