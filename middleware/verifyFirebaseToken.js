import admin from '../config/firebase.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from './asyncHandler.js';
import logger from '../utils/logger.js';

const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
    console.log('--- VERIFY FIREBASE TOKEN MIDDLEWARE CALLED ---');
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Auth token missing', 401));
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.firebaseUser = decodedToken; // { uid, email, firebase: { sign_in_provider }, ... }
        next();
    } catch (error) {
        logger.error('Firebase token verification failed during signup:', error.message);
        return next(new ErrorResponse('Invalid or expired auth token', 401));
    }
});

export default verifyFirebaseToken;
