const express = require('express');
const stockController = require('../controllers/stockController');
const router = express.Router();

router.get('/highest_volume', stockController.getHighestVolume);
router.get('/average_close', stockController.getAverageClose);
router.get('/average_vwap', stockController.getAverageVWAP);

module.exports = router;
