const express = require("express")
const router = express.Router()

const {
    testAuth,
    registerUser,
    loginUser
} = require("../controllers/authController")

const { protect } = require("../middleware/authMiddleware")

router.get("/test", testAuth)

router.post("/register", registerUser)

router.post("/login", loginUser)

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Profil bilgileri",
        user: req.user
    })
})

module.exports = router