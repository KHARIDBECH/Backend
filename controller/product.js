const Ad = require('../models/Product');
const globalConstant = require('../utils/globalConstant')
const {s3} = require('../middleware/multer');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')
const logger = require('../utils/logger')
exports.createProduct = async (req, res) => {
    const { title, description, price, category, location } = req.body;
    try {
        // Validate image upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No image files were uploaded.' });
        }

        // Extract image data and handle potential errors
        const images = [];
        for (const file of req.files) {
           
            const file_data = {
                filename: file.key,
                url: file.location // Assuming 'location' holds the S3 URL returned by multer-s3
            }
            const imageUrl = file.location; // Assuming 'location' holds the S3 URL
            if (!imageUrl) {
                console.error('Error obtaining image URL from multer-s3:', file);
                continue; // Skip to next image if URL not found
            }
            images.push(file_data);
        }


        // Create and save product (optional: destructuring assignment)

        const user = req.user;
        const newProduct = new Ad({
            title,
            description,
            price,
            category,
            location,
            postedBy: user[globalConstant.UNDERSCOREID],
            images: images.length > 0 ? images : undefined,
            // Set image only if images exist
        });

        const productResponse = await newProduct.save();

        res.status(201).json({ productResponse, message: 'Product created successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }

}






exports.getProduct = async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        logger.warn("Unauthorized access: Missing user ID.");
        return res.status(401).json({ message: "Unauthorized access: User ID is required." });
    }

    try {
        logger.info("Fetching products not posted by user:", userId);

        // Fetch products where the postedBy field is not equal to the user ID
        const productData = await Ad.find({ postedBy: { $ne: userId } });

        if (!productData.length) {
            logger.info("No products found not posted by user:", userId);
            return res.status(404).json({ message: "No products available." });
        }

        logger.info(`Found ${productData.length} products not posted by user:`, userId);
        res.status(200).json(productData);
    } catch (error) {
        logger.error("Error fetching products:", error.message);
        res.status(500).json({ message: "Failed to fetch products.", error: error.message });
    }
};

exports.getProductDetail = async (req, res) => {


    try {
        const product = await Ad.findById(req.params.itemid).populate('postedBy', 'firstName lastName')
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
      
        res.status(200).json(product)
    }
    catch (err) {
        res.status(500).json(err)
    }

}


exports.getAllCategories = async (req, res) => {
    const {category} = req.params
    try {
        const categories = await Ad.find({category:{ $regex: category, $options: 'i' }})
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getProductDetail = async (req, res) => {


    try {
        const product = await Ad.findById(req.params.itemid).populate('postedBy', 'firstName lastName')
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }
      
        res.status(200).json(product)
    }
    catch (err) {
        res.status(500).json(err)
    }

}

exports.deleteProduct = async (req, res) => 
    {
        const adId = req.params.id; // Get the ad ID from the request parameters
        const userId = req.user.id; // Get the authenticated user's ID
    
        try {
            // Find the ad by ID
            const ad = await Ad.findById(adId);
            if (!ad) {
                return res.status(404).json({ message: 'Ad not found' });
            }
    
            // Check if the ad belongs to the authenticated user
            if (ad.postedBy.toString() !== userId) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this ad.' });
            }
    
            // Delete images from S3
            const deletePromises = ad.images.map(imageKey => {
            
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: imageKey.filename,
                };
                 const command = new DeleteObjectCommand(params);
                return s3.send(command); ;
            });
    
            // Wait for all images to be deleted
            await Promise.all(deletePromises);
    
            // Delete the ad from the database
            await Ad.findByIdAndDelete(adId);
    
            res.status(200).json({ message: 'Ad deleted successfully' });
        } catch (error) {
            console.error("Error deleting ad:", error);
            res.status(500).json({ message: 'Error deleting ad' });
        }
}