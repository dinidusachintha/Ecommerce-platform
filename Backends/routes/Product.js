const express = require("express");
const router = express.Router();
const productController = require("../controllers/ProductController")

router.post("/add", productController.addProduct);
router.get("/", productController.getProducts);                    // Matches getProducts in controller
router.get("/category/:category", productController.getProductsByCategory); // Matches getProductsByCategory in controller
router.get("/get/:id", productController.getProductById);
router.put("/update/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);
router.post("/rate/:id", productController.rateProduct);

module.exports = router;