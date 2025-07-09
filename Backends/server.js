const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

// Import DB connection
import('./config/db.js');

const app = express();

// ✅ CORS setup with credentials
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL if different
  credentials: true
}));

// ✅ Middlewares
app.use(express.json());
app.use(bodyParser.json());

// ✅ Serve static files from /Uploads (update path if your images are stored elsewhere)
app.use('/Uploads', express.static(path.join(__dirname, 'Uploads')));

// ✅ Routes
const ProductRouter = require('./routes/Product.js');
app.use('/api/products', ProductRouter); // Adjusted to match your frontend Axios requests

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
