const express = require('express');
const router = express.Router();

const {
    generateOutfit,
    chatOutfit,
    createOutfit,
    getMyOutfits,
    deleteOutfit
} = require("../controllers/outfitController")

const { protect } = require("../middleware/authMiddleware")

// AI rotaları
router.post('/generate', protect, generateOutfit);
router.post('/chat', protect, chatOutfit);

// DB rotaları
router.post("/", protect, createOutfit)
router.get("/", protect, getMyOutfits)
router.delete("/:id", protect, deleteOutfit)

module.exports = router;
