import apiUtils from '../utils/apiUtils.js';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from './asyncHandler.js';

const verify_login_token = asyncHandler(async (req, res, next) => {
    logger.debug('Inside verify_login_token middleware');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const payload = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            return next(new ErrorResponse('No user found with this id', 404));
        }

        req.user = user;
        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
});

export default verify_login_token;
