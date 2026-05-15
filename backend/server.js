require("dotenv").config()

const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const clothingRoutes = require("./routes/clothingRoutes")

const authRoutes = require("./routes/authRoutes")

// MongoDB bağlantısı
connectDB()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test Route
app.get("/", (req, res) => {
    res.send("Youra API çalışıyor")
})

// Routes
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

app.use("/api/clothes", clothingRoutes)