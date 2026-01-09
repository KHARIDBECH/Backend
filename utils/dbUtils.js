import mongoose from 'mongoose';
import { envConfig } from '../config/env.config.js';
import logger from './logger.js';

const URI = envConfig.mongoose.url;

export const mongoConnect = () => {
    mongoose.connect(URI, { useFindAndModify: false, useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            logger.info('Successfully connected to DB');
        })
        .catch((error) => {
            logger.error('Unable to connect to MongoDB Atlas!');
            logger.error(error);
        });
}

export const mongoDisConnect = () => {
    mongoose.disconnect()
        .then(() => {
            logger.info('DB disconnected');
        })
        .catch((err) => {
            logger.error(`Error :: ${err}`);
        })
}