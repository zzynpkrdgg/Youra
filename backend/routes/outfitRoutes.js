const express = require("express")
const router = express.Router()

const {
    createOutfit,
    getMyOutfits,
    deleteOutfit
} = require("../controllers/outfitController")

const { protect } = require("../middleware/authMiddleware")

router.post("/", protect, createOutfit)

router.get("/", protect, getMyOutfits)

router.delete("/:id", protect, deleteOutfit)

module.exports = router