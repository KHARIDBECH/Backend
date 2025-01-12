
import apiUtils from '../utils/apiUtils.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config()


const optional_verify_login_token = async (req, res, next) => {
    logger.debug('Inside optional verify login token middleware');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        // If no token, continue without setting req.user
        req.user = null;
        return next();
    }

    try {
        const payload = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);
        req.user = await User.findById({ _id: payload.userId }).select('-password');
        next();
    } catch (error) {
        logger.warn('Invalid token or error in token verification:', error.message);
        // On error, continue without setting req.user
        req.user = null;
        next();
    }
};

export default optional_verify_login_token;
