const Product = require('../models/productModel');
const fs = require('fs').promises;
const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../Images');

async function deleteImage(filePath) {
  const fullPath = path.join(UPLOAD_DIR, filePath);
  try {
    await fs.unlink(fullPath);
    console.log(`Deleted image: ${filePath}`);
  } catch (err) {
    console.error(`Failed to delete file ${filePath}: ${err.message}`);
  }
}

class ProductController {
  static async addProduct(req, res) {
    try {
      const { productname, description, price, category, stock } = req.body;

      if (!productname || !description || !price || !category || !stock) {
        return res.status(400).json({ error: 'All fields (productname, description, price, category, stock) are required' });
      }

      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Price must be a valid non-negative number' });
      }
      if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: 'Stock must be a valid non-negative number' });
      }

      const images = req.files ? req.files.map(file => file.filename) : [];

      const newProduct = new Product({
        productname,
        description,
        price,
        images,
        category,
        stock,
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: 'Failed to add product: ' + err.message });
    }
  }

  static async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const query = category ? { category } : {};
      const products = await Product.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      const count = await Product.countDocuments(query);
      res.status(200).json({
        products,
        totalPages: Math.ceil(count / limit),
        currentPage: page * 1,
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ error: 'Failed to fetch products: ' + err.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const productData = await Product.findById(req.params.id);
      if (!productData) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(200).json(productData);
    } catch (err) {
      console.error('Error fetching product:', err);
      res.status(500).json({ error: 'Failed to fetch product: ' + err.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const { productname, description, price, category, stock, imagesToDelete } = req.body;
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (!productname || !description || !price || !category || !stock) {
        return res.status(400).json({ error: 'All fields (productname, description, price, category, stock) are required' });
      }

      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Price must be a valid non-negative number' });
      }
      if (isNaN(stock) || stock < 0) {
        return res.status(400).json({ error: 'Stock must be a valid non-negative number' });
      }

      let deleteIndices = [];
      if (imagesToDelete) {
        try {
          deleteIndices = JSON.parse(imagesToDelete);
          if (!Array.isArray(deleteIndices)) {
            return res.status(400).json({ error: 'imagesToDelete must be an array' });
          }
        } catch (err) {
          return res.status(400).json({ error: 'Invalid imagesToDelete format' });
        }
      }

      if (deleteIndices.length > 0) {
        const imagesToKeep = existingProduct.images.filter((_, index) => !deleteIndices.includes(index));
        const deletePromises = existingProduct.images
          .filter((_, index) => deleteIndices.includes(index))
          .map(image => deleteImage(image));
        await Promise.all(deletePromises);
        existingProduct.images = imagesToKeep;
      }

      if (req.files && req.files.length > 0) {
        const newImageFilenames = req.files.map(file => file.filename);
        existingProduct.images = [...existingProduct.images, ...newImageFilenames];
      }

      existingProduct.productname = productname;
      existingProduct.description = description;
      existingProduct.price = price;
      existingProduct.category = category;
      existingProduct.stock = stock;
      existingProduct.updatedAt = Date.now();

      await existingProduct.save();
      res.status(200).json({ message: 'Product updated successfully', product: existingProduct });
    } catch (err) {
      console.error('Error updating product:', err);
      res.status(500).json({ error: 'Failed to update product: ' + err.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const productToDelete = await Product.findById(req.params.id);

      if (!productToDelete) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (productToDelete.images.length > 0) {
        const deletePromises = productToDelete.images.map(image => deleteImage(image));
        await Promise.all(deletePromises);
      }

      await Product.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Failed to delete product: ' + err.message });
    }
  }

  static async rateProduct(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      const productData = await Product.findById(id);
      if (!productData) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const newRating = (productData.rating * productData.ratingCount + rating) / (productData.ratingCount + 1);
      productData.rating = newRating;
      productData.ratingCount += 1;

      await productData.save();
      res.status(200).json({ message: 'Rating submitted successfully', product: productData });
    } catch (err) {
      console.error('Error rating product:', err);
      res.status(500).json({ error: 'Failed to submit rating: ' + err.message });
    }
  }
}

module.exports = ProductController;