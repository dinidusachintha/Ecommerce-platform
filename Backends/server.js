const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const path = require('path');

import('./config/db.js');

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const BlogRouter = require('./routes/Product.js');

app.use('./Uploads', express.static(path.join(__dirname, 'Images')));

app.use('/Blog', BlogRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
