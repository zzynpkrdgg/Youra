const express = require('express');
const router = express.Router();

const {
    generateOutfit,
    chatOutfit,
    createOutfit,
    getMyOutfits,
    deleteOutfit,
    toggleFavoriteOutfit,
    getFavoriteOutfits
} = require("../controllers/outfitController")

const { protect } = require("../middleware/authMiddleware")

// AI rotaları
router.post('/generate', protect, generateOutfit);
router.post('/chat', protect, chatOutfit);

// DB rotaları
router.post("/", protect, createOutfit)
router.get("/", protect, getMyOutfits)
router.delete("/:id", protect, deleteOutfit)
router.get("/favorites", protect, getFavoriteOutfits)
router.patch("/:id/favorite", protect, toggleFavoriteOutfit)

module.exports = router;
