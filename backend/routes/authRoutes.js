const express = require("express")
const router = express.Router()

const {
    testAuth,
    registerUser,
    loginUser
} = require("../controllers/authController")

router.get("/test", testAuth)

router.post("/register", registerUser)

router.post("/login", loginUser)

module.exports = router

