import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required().description('MongoDB connection string'),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_REGION: Joi.string().required(),
    AWS_BUCKET_NAME: Joi.string().required(),
    // Add other critical env vars here as the project grows
}).unknown().required();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const envConfig = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongoose: {
        url: envVars.MONGO_URI,
    },
    aws: {
        accessKeyId: envVars.AWS_ACCESS_KEY_ID,
        secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
        region: envVars.AWS_REGION,
        bucketName: envVars.AWS_BUCKET_NAME,
    }
};
