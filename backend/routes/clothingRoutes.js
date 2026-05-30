const express = require("express")
const router = express.Router()

const {
    analyzeClothing,
    addClothing,
    getMyClothes,
    uploadClothing,
    deleteClothing,
    updateClothing,
    updateClothingStatus
} = require("../controllers/clothingController")

const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

// AI Kıyafet Analizi rotası
router.post('/analyze', protect, analyzeClothing);

// Arkadaşının eklediği rotalar
router.post("/", protect, addClothing)
router.get("/", protect, getMyClothes)
router.post("/upload", protect, upload.single("image"), uploadClothing)
router.patch("/:id/status", protect, updateClothingStatus)
router.delete("/:id", protect, deleteClothing)
router.put("/:id", protect, upload.single("image"), updateClothing)

module.exports = router