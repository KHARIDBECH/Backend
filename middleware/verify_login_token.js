
import apiUtils from '../utils/apiUtils.js';
import { StatusCodes } from 'http-status-codes';
import User from '../models/user.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config()


const verify_login_token = async (req, res, next) => {
    logger.debug('inside verify User for login middleware')
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    try {
        const payload = await apiUtils.verifyAccessToken(token, process.env.TOKEN_SECRET);
        req.user = await User.findById({ _id: payload.userId }).select('-password');
        next();
    }
    catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json(error);
    }

}

export default verify_login_token;
