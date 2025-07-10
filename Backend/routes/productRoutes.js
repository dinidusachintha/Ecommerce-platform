const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/productModel');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // save to /uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// ➡️ GET /api/products (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category && category !== 'general' ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error('Fetch products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ➡️ POST /api/products (add new product with images)
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const { productname, description, price, category, stock } = req.body;
    const imagePaths = req.files.map(file => '/' + file.path.replace(/\\/g, '/')); // fix for Windows paths

    const product = new Product({
      productname,
      description,
      price,
      category,
      stock,
      images: imagePaths,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Add product error:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// ➡️ POST /api/products/seed (seed sample data)
router.post('/seed', async (req, res) => {
  try {
    await Product.deleteMany({}); // clear existing

    const sampleProducts = [
      {
        productname: 'Women T-Shirt',
        description: 'Cotton casual t-shirt for women',
        price: 19.99,
        category: 'women',
        stock: 'in-stock',
        images: ['/uploads/sample-women.jpg'],
        rating: 4.2,
        ratingCount: 17,
      },
      {
        productname: 'Men Hoodie',
        description: 'Warm fleece hoodie for men',
        price: 39.99,
        category: 'men',
        stock: 'limited',
        images: ['/uploads/sample-men.jpg'],
        rating: 4.5,
        ratingCount: 23,
      },
    ];

    await Product.insertMany(sampleProducts);
    res.status(201).json({ message: 'Sample products seeded' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Failed to seed sample data' });
  }
});

module.exports = router;
