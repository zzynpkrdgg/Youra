const express = require("express")
const router = express.Router()

const {
    addClothing,
    getMyClothes,
    uploadClothing,
    deleteClothing,
    updateClothing
} = require("../controllers/clothingController")

const { protect } = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

router.post("/", protect, addClothing)

router.get("/", protect, getMyClothes)

router.post("/upload", protect, upload.single("image"), uploadClothing)

router.delete("/:id", protect, deleteClothing)

router.put("/:id", protect, updateClothing)

module.exports = router