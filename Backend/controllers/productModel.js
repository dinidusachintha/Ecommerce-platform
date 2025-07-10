const router = require("express").Router();
const product = require("../models/productModel");
const multer = require("multer");
const fs = require("fs").promises;
const path = require("path");

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, "../Images");

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            await fs.access(UPLOAD_DIR);
            cb(null, UPLOAD_DIR);
        } catch (err) {
            await fs.mkdir(UPLOAD_DIR, { recursive: true });
            cb(null, UPLOAD_DIR);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Only JPEG and PNG images are allowed"));
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).array("newImages", 10);

async function deleteImage(filePath) {
    const fullPath = path.join(UPLOAD_DIR, filePath);
    try {
        await fs.unlink(fullPath);
        console.log(`Deleted image: ${filePath}`);
    } catch (err) {
        throw new Error(`Failed to delete file ${filePath}: ${err.message}`);
    }
}

router.post("/add", upload, async (req, res) => {
    try {
        const { productname, description, price, category, stock } = req.body;

        if (!productname || !description || !price || !category || !stock) {
            return res.status(400).json({ error: "All fields (productname, description, price, category, stock) are required" });
        }

        if (isNaN(price) || price < 0) {
            return res.status(400).json({ error: "Price must be a valid non-negative number" });
        }
        if (isNaN(stock) || stock < 0) {
            return res.status(400).json({ error: "Stock must be a valid non-negative number" });
        }

        const images = req.files ? req.files.map((file) => file.filename) : [];

        const newproduct = new product({
            productname,
            description,
            price,
            images,
            category,
            stock,
        });

        await newproduct.save();
        res.status(200).json(newproduct);
    } catch (err) {
        console.error("Error in /add route:", err);
        res.status(500).json({ error: "Failed to add product: " + err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const products = await product
            .find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const count = await product.countDocuments();
        res.status(200).json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: page * 1,
        });
    } catch (err) {
        console.error("Error in / route:", err);
        res.status(500).json({ error: "Failed to fetch products: " + err.message });
    }
});

router.get("/category/:category", async (req, res) => {
    try {
        const { category } = req.params;
        const products = await product.find({ category });
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ error: `No products found for category: ${category}` });
        }
    } catch (err) {
        console.error("Error in /category route:", err);
        res.status(500).json({ error: "Failed to fetch products: " + err.message });
    }
});

router.get("/get/:id", async (req, res) => {
    try {
        const productData = await product.findById(req.params.id);
        if (!productData) {
            return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(productData);
    } catch (err) {
        console.error("Error in /get/:id route:", err);
        res.status(500).json({ error: "Failed to fetch product: " + err.message });
    }
});

router.put("/update/:id", upload, async (req, res) => {
    try {
        const { productname, description, price, category, stock, imagesToDelete } = req.body;
        const existingproduct = await product.findById(req.params.id);

        if (!existingproduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (!productname || !description || !price || !category || !stock) {
            return res.status(400).json({ error: "All fields (productname, description, price, category, stock) are required" });
        }

        if (isNaN(price) || price < 0) {
            return res.status(400).json({ error: "Price must be a valid non-negative number" });
        }
        if (isNaN(stock) || stock < 0) {
            return res.status(400).json({ error: "Stock must be a valid non-negative number" });
        }

        let deleteIndices = [];
        if (imagesToDelete) {
            try {
                deleteIndices = JSON.parse(imagesToDelete);
                if (!Array.isArray(deleteIndices)) {
                    return res.status(400).json({ error: "imagesToDelete must be an array" });
                }
            } catch (err) {
                return res.status(400).json({ error: "Invalid imagesToDelete format" });
            }
        }

        if (deleteIndices.length > 0) {
            const imagesToKeep = existingproduct.images.filter((_, index) => !deleteIndices.includes(index));
            const deletePromises = existingproduct.images
                .filter((_, index) => deleteIndices.includes(index))
                .map((image) => deleteImage(image));
            await Promise.all(deletePromises);
            existingproduct.images = imagesToKeep;
        }

        if (req.files && req.files.length > 0) {
            const newImageFilenames = req.files.map((file) => file.filename);
            existingproduct.images = [...existingproduct.images, ...newImageFilenames];
        }

        existingproduct.productname = productname;
        existingproduct.description = description;
        existingproduct.price = price;
        existingproduct.category = category;
        existingproduct.stock = stock;
        existingproduct.updatedAt = Date.now();

        await existingproduct.save();
        res.status(200).json({ message: "Product updated successfully", product: existingproduct });
    } catch (err) {
        console.error("Error in /update/:id route:", err);
        res.status(500).json({ error: "Failed to update product: " + err.message });
    }
});

router.delete("/delete/:id", async (req, res) => {
    try {
        const productToDelete = await product.findById(req.params.id);

        if (!productToDelete) {
            return res.status(404).json({ error: "Product not found" });
        }

        if (productToDelete.images.length > 0) {
            const deletePromises = productToDelete.images.map((image) => deleteImage(image));
            await Promise.all(deletePromises);
        }

        await product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (err) {
        console.error("Error in /delete/:id route:", err);
        res.status(500).json({ error: "Failed to delete product: " + err.message });
    }
});

router.post("/rate/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        const productData = await product.findById(id);
        if (!productData) {
            return res.status(404).json({ error: "Product not found" });
        }

        const newRating = (productData.rating * productData.ratingCount + rating) / (productData.ratingCount + 1);
        productData.rating = newRating;
        productData.ratingCount += 1;

        await productData.save();
        res.status(200).json({ message: "Rating submitted successfully", product: productData });
    } catch (err) {
        console.error("Error in /rate/:id route:", err);
        res.status(500).json({ error: "Failed to submit rating: " + err.message });
    }
});

module.exports = router;