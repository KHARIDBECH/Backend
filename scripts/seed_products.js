
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Ad from '../models/product.js';
import User from '../models/user.js';

dotenv.config();

const productsToSeed = [
    {
        title: 'iPhone 14 Pro Max - Deep Purple',
        description: 'Battery health 98%, with original box and cable. Under warranty until Dec 2025. Barely used device with no scratches or dents.',
        price: 95000,
        category: 'Mobiles',
        subcategory: 'Mobile Phones',
        condition: 'Used', // Adjusted enum
        negotiable: true,
        // brand: 'Apple', // Removed
        // model: 'iPhone 14 Pro Max', // Removed
        // year: 2023, // Removed
        // features: ... // Removed
        location: {
            city: 'Mumbai',
            state: 'Maharashtra'
            // country removed
        },
        // Using imageFiles/images logic as per previous script structure
        images: [
            { url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=800&q=80', filename: 'seed/iphone.jpg' }
        ]
    },
    {
        title: 'Royal Enfield Classic 350',
        description: '2022 Model, Stealth Black. Single owner, regularly serviced at authorized service center. Moving abroad hence selling.',
        price: 185000,
        category: 'Vehicles', // Updated category
        subcategory: 'Motorcycles',
        condition: 'Used',
        negotiable: false,
        location: {
            city: 'Bangalore',
            state: 'Karnataka'
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?auto=format&fit=crop&w=800&q=80', filename: 'seed/bike.jpg' }
        ]
    },
    {
        title: 'Hyundai Creta SX (O) Diesel',
        description: 'Top model, panoramic sunroof, ventilated seats. pristine condition. All services done at authorized workshop.',
        price: 1450000,
        category: 'Vehicles',
        subcategory: 'Cars',
        condition: 'Used',
        negotiable: true,
        location: {
            city: 'Delhi',
            state: 'Delhi'
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1609520505218-7421da3b3d4d?auto=format&fit=crop&w=800&q=80', filename: 'seed/car.jpg' }
        ]
    },
    {
        title: 'Sony Bravia 55 inch 4K Smart TV',
        description: 'Android TV with all streaming apps. Amazing picture quality. Wall mount included. Selling because upgrading to 65 inch.',
        price: 45000,
        category: 'Electronics', // Valid enum
        subcategory: 'TVs, Video - Audio',
        condition: 'Used',
        negotiable: true,
        location: {
            city: 'Hyderabad',
            state: 'Telangana'
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80', filename: 'seed/tv.jpg' }
        ]
    },
    {
        title: 'MacBook Air M1',
        description: 'Space Grey, 8GB RAM, 256GB SSD. Perfect condition. Battery cycle count 45. Comes with original charger and box.',
        price: 62000,
        category: 'Electronics',
        subcategory: 'Computers & Laptops',
        condition: 'Used', // Adjusted enum
        negotiable: false,
        location: {
            city: 'Pune',
            state: 'Maharashtra'
        },
        images: [
            { url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', filename: 'seed/macbook.jpg' }
        ]
    }
];


const seedProducts = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        // 1. Get a user to assign these products to
        // Try to find a user, or create a dummy one if absolutely needed (but better to use existing)
        let user = await User.findOne();

        if (!user) {
            console.log('⚠️ No users found. Creating a temporary seed user...');
            // Simple dummy user creation for seeding if DB is empty
            // Ideally we should rely on existing users, but this makes the script robust
            const dummyUser = new User({
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@kharidbech.com',
                password: 'password123', // This won't work if you have hashing pre-save hooks that are complex, but usually fine
                phone: '9876543210'
            });
            // If you have strict validation/hashing content, finding one is safer.
            // But if absolutely empty, we can't seed products without an owner.
            // We'll skip user creation complexity here to avoid breaking and just assume a user exists.
            console.error('❌ No users found in DB. Please signup a user via the app first.');
            process.exit(1);
        }

        console.log(`👤 Posting ads as: ${user.firstName} ${user.lastName} (${user._id})`);

        // 3. Insert new ads
        console.log('🚀 Seeding real-world products...');

        const productsWithUser = productsToSeed.map(p => ({
            ...p,
            postedBy: user._id
        }));

        // We use insertMany. The pre-save hooks (like slug generation) might NOT run with insertMany depending on Mongoose version/options.
        // To be safe and get slugs, we'll loop and save.

        for (const pData of productsWithUser) {
            const product = new Ad(pData);
            await product.save(); // This triggers the pre-save hook for productUrl
            console.log(`   - Created: ${pData.title}`);
        }

        console.log('✨ Seeded successfully!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error seeding:', err);
        process.exit(1);
    }
};

seedProducts();
