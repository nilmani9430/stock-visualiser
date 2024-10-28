const express = require('express');
const multer = require('multer');
const stockController = require('../controllers/stockController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), stockController.uploadCSV);

module.exports = router;
