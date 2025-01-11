import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const apiUtils = {
    getResponseMessage: (statusCode, message) => {
        return {
            statusCode,
            message
        };
    },

    generateAccessToken: (payload, token_secret) => {
        return jwt.sign(payload, token_secret, { expiresIn: '3600000s' });
    },

    verifyAccessToken: (token, token_secret) => {
        return new Promise((resolve, reject) => {
            jwt.verify(token, token_secret, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded);
                }
            });
        });
    }
};

export default apiUtils; // Exporting the apiUtils object as the default export