const express = require("express")
const router = express.Router()

const {
    getWeather,
    getWeatherForecast
} = require("../controllers/weatherController")

router.get("/", getWeather)
router.get("/forecast", getWeatherForecast)

module.exports = router