const express = require('express');
const router = express.Router();
const clothingController = require('../controllers/clothingController');

// Resim yükleme ve analiz etme rotası
router.post('/upload', clothingController.analyzeClothing);

module.exports = router;
