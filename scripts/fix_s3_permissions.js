
import dotenv from 'dotenv';
import { S3Client, PutBucketPolicyCommand, DeletePublicAccessBlockCommand } from '@aws-sdk/client-s3';

dotenv.config();

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_REGION = process.env.AWS_REGION;

if (!AWS_BUCKET_NAME || !AWS_REGION) {
    console.error('AWS_BUCKET_NAME and AWS_REGION must be defined in .env');
    process.exit(1);
}

const s3 = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const makeBucketPublic = async () => {
    try {
        console.log(`Attempting to make bucket '${AWS_BUCKET_NAME}' public...`);

        // 1. Remove Block Public Access settings
        // This allows us to add a public bucket policy and ACLs
        try {
            console.log('Disabling "Block Public Access" on the bucket...');
            await s3.send(new DeletePublicAccessBlockCommand({
                Bucket: AWS_BUCKET_NAME
            }));
            console.log('Successfully disabled Block Public Access.');
        } catch (err) {
            console.warn('Warning: Could not disable Block Public Access. It might already be disabled or you lack permissions.', err.message);
        }

        // 2. Add Bucket Policy for Public Read
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicReadGetObject",
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${AWS_BUCKET_NAME}/*`
                }
            ]
        };

        console.log('Applying public read bucket policy...');
        await s3.send(new PutBucketPolicyCommand({
            Bucket: AWS_BUCKET_NAME,
            Policy: JSON.stringify(policy)
        }));

        console.log('Success! Bucket policy updated to allow public read access.');
        console.log('Your images should now be visible on the frontend.');

    } catch (err) {
        console.error('Error making bucket public:', err);
        console.error('\nIf this failed, you may need to go to the AWS Console -> S3 -> Permissions and manually:');
        console.error('1. Uncheck "Block all public access".');
        console.error('2. Add a Bucket Policy allowing s3:GetObject for *');
    }
};

makeBucketPublic();
