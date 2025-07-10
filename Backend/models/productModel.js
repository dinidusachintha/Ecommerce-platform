// models/Product.js

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: String, required: true },
  images: [{ type: String }],

  // Optional fields for ProductView enhancements
  brand: { type: String, default: 'Generic Brand' },
  rating: { type: Number, default: 4.5 },
  ratingCount: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  colors: [String],
  sizes: [String],
  features: [String],
});

module.exports = mongoose.model('Product', productSchema);
