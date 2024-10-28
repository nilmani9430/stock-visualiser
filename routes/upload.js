const express = require('express');
const multer = require('multer');
const stockController = require('../controllers/stockController');
const router = express.Router();

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Define the upload route
router.post('/', upload.single('file'), stockController.uploadCSV);

module.exports = router;
