const router = require('express').Router();
const ProductController = require('../controllers/ProductController');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../Images');

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
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).array('images', 10);

router.post('/add', upload, ProductController.addProduct);
router.get('/', ProductController.getProducts);
router.get('/get/:id', ProductController.getProductById);
router.put('/update/:id', upload, ProductController.updateProduct);
router.delete('/delete/:id', ProductController.deleteProduct);
router.post('/rate/:id', ProductController.rateProduct);

module.exports = router;