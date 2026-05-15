const express = require("express")
const router = express.Router()

const {
    analyzeClothing,
    addClothing,
    getMyClothes,
    uploadClothing,
    deleteClothing
} = require("../controllers/clothingController")

const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

// Arkadaşının eklediği rotalar
router.post("/", protect, addClothing)
router.get("/", protect, getMyClothes)
router.post("/upload", protect, upload.single("image"), uploadClothing)
router.delete("/:id", protect, deleteClothing)

// AI Kıyafet Analizi rotası (çakışmayı önlemek için /analyze yapıldı)
router.post('/analyze', analyzeClothing);

module.exports = router
