const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['women', 'men', 'kids'],
    default: 'women',
  },
  stock: {
    type: String,
    required: [true, 'Stock status is required'],
    enum: ['in-stock', 'out-of-stock', 'limited'],
    default: 'in-stock',
  },
  images: {
    type: [String], // Array of image URLs or file paths
    required: [true, 'At least one image is required'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);