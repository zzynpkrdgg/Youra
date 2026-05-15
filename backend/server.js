require("dotenv").config()

const express = require("express")
const cors = require("cors")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test Route
app.get("/", (req, res) => {
    res.send("Youra API çalışıyor")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const authRoutes = require("./routes/authRoutes")
app.use("/api/auth", authRoutes)