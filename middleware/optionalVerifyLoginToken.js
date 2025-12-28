import apiUtils from '../utils/apiUtils.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import asyncHandler from './asyncHandler.js';

const optional_verify_login_token = asyncHandler(async (req, res, next) => {
    logger.debug('Inside optional verify login token middleware');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const payload = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);
        req.user = await User.findById(payload.userId).select('-password');
        next();
    } catch (error) {
        logger.warn('Optional token verification failed:', error.message);
        req.user = null;
        next();
    }
});

export default optional_verify_login_token;
