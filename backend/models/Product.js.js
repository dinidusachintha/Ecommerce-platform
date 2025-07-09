const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be at least 0'],
    max: [100000, 'Price cannot exceed 100000']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be at least 0'],
    max: [100000, 'Original price cannot exceed 100000'],
    validate: {
      validator: function(value) {
        return value >= this.price;
      },
      message: 'Original price must be greater than or equal to sale price'
    }
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['women', 'men', 'kids'],
      message: 'Please select correct category'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: [0, 'Stock cannot be negative'],
    max: [10000, 'Stock cannot exceed 10000']
  },
  images: {
    type: [String],
    required: [true, 'Product images are required'],
    validate: {
      validator: function(value) {
        return value.length > 0;
      },
      message: 'At least one image is required'
    }
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);