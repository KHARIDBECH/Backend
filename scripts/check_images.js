
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Ad from '../models/product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const checkImages = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Get one product
        const product = await Ad.findOne();
        if (product) {
            console.log("Images Type:", typeof product.images);
            console.log("First Image:", product.images[0]);
            console.log("Is String?", typeof product.images[0] === 'string');
            console.log("Is Object?", typeof product.images[0] === 'object');
            console.log("Full Images Data:", JSON.stringify(product.images, null, 2));
        } else {
            console.log("No products found.");
        }

        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

checkImages();
