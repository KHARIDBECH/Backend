require('dotenv').config(); // Load environment variables
const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');

// Configure the S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Configure multer with S3
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME, // Adjust according to your needs
        key : (req, file, cb) => {
            // Generate a unique identifier
            const uniqueId = uuidv4(); // Generate a unique ID
            const sanitizedFileName = file.originalname.toLowerCase()
                .replace(/[^a-z0-9.]+/g, '-') // Replace non-alphanumeric characters with hyphens
                .replace(/^-+|-+$/g, '') // Remove leading and trailing hyphens
                .trim(); // Trim whitespace
            // Construct the final file name
            const fileName = `Ad/${uniqueId}-${sanitizedFileName}`;
            // Call the callback with the generated file name
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, and .jpeg formats allowed!'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});
module.exports = upload;