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

module.exports = {
    getWeather
}