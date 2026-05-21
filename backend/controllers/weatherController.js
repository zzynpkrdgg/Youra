const getWeather = async (req, res) => {
    try {
        const { lat, lon } = req.query

        if (!lat || !lon) {
            return res.status(400).json({
                message: "Latitude ve longitude zorunludur"
            })
        }

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`

        const response = await fetch(url)
        const data = await response.json()

        if (!data.current_weather) {
            return res.status(404).json({
                message: "Hava durumu bilgisi bulunamadı"
            })
        }

        const weather = data.current_weather

        res.status(200).json({
            message: "Hava durumu getirildi",
            location: {
                latitude: Number(lat),
                longitude: Number(lon)
            },
            weather: {
                temperature: weather.temperature,
                windspeed: weather.windspeed,
                weathercode: weather.weathercode,
                time: weather.time
            }
        })

    } catch (error) {
        res.status(500).json({
            message: "Hava durumu alınırken hata oluştu",
            error: error.message
        })
    }
}

const getWeatherForecast = async (req, res) => {
    try {
        const { lat, lon, days } = req.query

        if (!lat || !lon) {
            return res.status(400).json({
                message: "Latitude ve longitude zorunludur"
            })
        }

        const forecastDays = Number(days) || 7

        if (forecastDays < 1 || forecastDays > 16) {
            return res.status(400).json({
                message: "days değeri 1 ile 16 arasında olmalıdır"
            })
        }

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&daily=weathercode,temperature_2m_max,temperature_2m_min,windspeed_10m_max,precipitation_probability_max` +
            `&forecast_days=${forecastDays}` +
            `&timezone=auto`

        const response = await fetch(url)
        const data = await response.json()

        if (!data.daily) {
            return res.status(404).json({
                message: "Günlük hava tahmini bulunamadı"
            })
        }

        const forecast = data.daily.time.map((date, index) => ({
            date,
            weathercode: data.daily.weathercode[index],
            temperatureMax: data.daily.temperature_2m_max[index],
            temperatureMin: data.daily.temperature_2m_min[index],
            windspeedMax: data.daily.windspeed_10m_max[index],
            precipitationProbability: data.daily.precipitation_probability_max[index]
        }))

        res.status(200).json({
            message: "Günlük hava tahmini getirildi",
            location: {
                latitude: Number(lat),
                longitude: Number(lon)
            },
            count: forecast.length,
            forecast
        })

    } catch (error) {
        res.status(500).json({
            message: "Günlük hava tahmini alınırken hata oluştu",
            error: error.message
        })
    }
}

module.exports = {
    getWeather,
    getWeatherForecast
}