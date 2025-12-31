import mongoose from 'mongoose';

const AdSchema = new mongoose.Schema({
    // Core OLX fields
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [10, 'Title should be at least 10 characters'],
        maxlength: [100, 'Title should not exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [20, 'Description should be at least 20 characters'],
        maxlength: [2000, 'Description should not exceed 2000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },

    // Category & Subcategory
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'Cars', 'Bikes', 'Mobiles', 'Electronics',
            'Appliances', 'Furniture', 'Watches', 'Books',
            'Clothing', 'Sports', 'Pets', 'Services', 'Jobs', 'Others', 'Vehicles', 'Property', 'Fashion'
        ]
    },
    subcategory: {
        type: String,
        required: [true, 'Subcategory is required']
    },

    // Images
    images: [{
        url: { type: String, required: true },
        filename: { type: String, required: true }
    }],

    // Location (simple - no coordinates)
    location: {
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String,
            required: [true, 'State is required']
        }
    },

    // Seller info
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Additional fields
    condition: {
        type: String,
        enum: ['New', 'Used', 'Refurbished'],
        default: 'Used'
    },
    negotiable: {
        type: Boolean,
        default: false
    },

    // Status
    status: {
        type: String,
        enum: ['Active', 'Sold', 'Expired'],
        default: 'Active'
    },

    // For clean URLs
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Generate slug from title
AdSchema.pre('save', function (next) {
    if (!this.slug) {
        const randomId = Math.random().toString(36).substring(2, 9);
        const slugFromTitle = this.title
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);

        this.slug = `${slugFromTitle}-${randomId}`;
    }
    next();
});

// Indexes for performance
AdSchema.index({ postedBy: 1, status: 1 });
AdSchema.index({ category: 1, subcategory: 1, status: 1 });
AdSchema.index({ 'location.city': 1, status: 1 });
AdSchema.index({ createdAt: -1 });
AdSchema.index({ slug: 1 }, { unique: true });

export default mongoose.model('Ad', AdSchema);