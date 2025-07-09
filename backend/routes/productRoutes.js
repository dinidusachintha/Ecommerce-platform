const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const upload = require('../middlewares/upload');
const { protect, admin } = require('../middlewares/auth');

router.route('/')
  .get(getProducts)
  .post(protect, admin, upload.array('images'), createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, admin, upload.array('images'), updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;