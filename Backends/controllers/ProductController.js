const Product = require("../models/Product");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(__dirname, "../Uploads");
    try {
      if (!await fs.access(dir).then(() => true).catch(() => false)) {
        await fs.mkdir(dir, { recursive: true });
      }
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage }).array("newImages", 10);

async function deleteImage(filePath) {
  const fullPath = path.join(__dirname, "../Uploads", filePath);
  try {
    await fs.unlink(fullPath);
    console.log(`Deleted image: ${filePath}`);
  } catch (err) {
    console.error(`Failed to delete file ${filePath}:`, err);
  }
}

const addProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "File upload failed: " + err.message });

    try {
      const { productname, description, price, category, stock } = req.body;
      if (!productname || !description || !price || !category || !stock) {
        return res.status(400).json({ error: "All fields are required" });
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
      res.status(200).json(newProduct);
    } catch (err) {
      console.error("Error in addProduct:", err);
      res.status(500).json({ error: "Failed to add product: " + err.message });
    }
  });
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({ error: "Failed to fetch products: " + err.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });
    if (products.length > 0) {
      res.status(200).json(products);
    } else {
      res.status(404).json({ message: `No products found for category: ${category}` });
    }
  } catch (err) {
    console.error("Error in getProductsByCategory:", err);
    res.status(500).json({ error: "Failed to fetch products: " + err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("Error in getProductById:", err);
    res.status(500).json({ error: "Failed to fetch product: " + err.message });
  }
};

const updateProduct = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "File upload failed: " + err.message });

    try {
      const { productname, description, price, category, stock, imagesToDelete } = req.body;
      const existingProduct = await Product.findById(req.params.id);

      if (!existingProduct) return res.status(404).json({ message: "Product not found" });

      if (!productname || !description || !price || !category || !stock) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const deleteIndices = imagesToDelete ? JSON.parse(imagesToDelete) : [];
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
      res.status(200).json({ message: "Product updated successfully", product: existingProduct });
    } catch (err) {
      console.error("Error in updateProduct:", err);
      res.status(500).json({ error: "Failed to update product: " + err.message });
    }
  });
};

const deleteProduct = async (req, res) => {
  try {
    const productToDelete = await Product.findById(req.params.id);

    if (!productToDelete) return res.status(404).json({ message: "Product not found" });

    if (productToDelete.images.length > 0) {
      const deletePromises = productToDelete.images.map(image => deleteImage(image));
      await Promise.all(deletePromises);
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error in deleteProduct:", err);
    res.status(500).json({ error: "Failed to delete product: " + err.message });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const newRating = (product.rating * product.ratingCount + rating) / (product.ratingCount + 1);
    product.rating = newRating;
    product.ratingCount += 1;

    await product.save();
    res.status(200).json({ message: "Rating submitted successfully", product });
  } catch (err) {
    console.error("Error in rateProduct:", err);
    res.status(500).json({ error: "Failed to submit rating: " + err.message });
  }
};

module.exports = {
  addProduct,
  getProducts,
  getProductsByCategory,
  getProductById,
  updateProduct,
  deleteProduct,
  rateProduct,
};
