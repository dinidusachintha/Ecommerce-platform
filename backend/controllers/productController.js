const Product = require('../models/Product.js');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search } = req.query;
  
  let query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const products = await Product.find(query).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  res.json({
    success: true,
    data: product
  });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, originalPrice, category, stock } = req.body;
  
  // Get uploaded files
  const images = req.files.map(file => `/uploads/${file.filename}`);
  
  const product = new Product({
    name,
    description,
    price,
    originalPrice: originalPrice || price,
    category,
    stock,
    images
  });
  
  const createdProduct = await product.save();
  
  res.status(201).json({
    success: true,
    data: createdProduct
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, originalPrice, category, stock } = req.body;
  
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.originalPrice = originalPrice || product.originalPrice || price || product.price;
  product.category = category || product.category;
  product.stock = stock || product.stock;
  
  // Handle new images if uploaded
  if (req.files && req.files.length > 0) {
    // Remove old images from server
    product.images.forEach(image => {
      const imagePath = path.join(__dirname, '..', 'public', image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    });
    
    // Add new images
    product.images = req.files.map(file => `/uploads/${file.filename}`);
  }
  
  const updatedProduct = await product.save();
  
  res.json({
    success: true,
    data: updatedProduct
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  
  // Remove images from server
  product.images.forEach(image => {
    const imagePath = path.join(__dirname, '..', 'public', image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  });
  
  await product.remove();
  
  res.json({
    success: true,
    message: 'Product removed'
  });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};