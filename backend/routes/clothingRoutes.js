const express = require("express")
const router = express.Router()

const {
    addClothing,
    getMyClothes
} = require("../controllers/clothingController")

const { protect } = require("../middleware/authMiddleware")

router.post("/", protect, addClothing)

router.get("/", protect, getMyClothes)

module.exports = router