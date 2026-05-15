const express = require('express');
const router = express.Router();
const outfitController = require('../controllers/outfitController');

// Kombin oluşturma rotası
router.post('/generate', outfitController.generateOutfit);
router.post('/chat', outfitController.chatOutfit);

module.exports = router;
