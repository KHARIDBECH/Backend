const Ad = require('../models/product');
const globalConstant = require('../utils/globalConstant')


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




exports.getProduct = (req, res) => {

    Ad.find()
    .then((productData) => {
        res.status(200).json(productData);
    })
    .catch((error) => {
        res.status(400).json({ error: error.message });
    });
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
