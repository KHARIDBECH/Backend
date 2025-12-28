import admin from '../config/firebase.js';
import User from '../models/user.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from './asyncHandler.js';
import logger from '../utils/logger.js';

const firebaseAuth = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify Firebase ID Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { uid } = decodedToken;

        // Find user in local database by firebaseUid
        let user = await User.findOne({ firebaseUid: uid });

        if (!user) {
            logger.warn(`User with Firebase UID ${uid} not found in database.`);
            return next(new ErrorResponse('User not found in database. Please register.', 404));
        }

        req.user = user;
        req.firebaseUser = decodedToken;
        next();
    } catch (error) {
        logger.error('Firebase token verification failed:', error.message);
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

export default firebaseAuth;
