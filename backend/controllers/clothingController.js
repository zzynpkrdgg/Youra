const Clothing = require("../models/Clothing")

const addClothing = async (req, res) => {
    try {
        const { image, category, color, style, season } = req.body

        if (!image || !category || !color || !style || !season) {
            return res.status(400).json({
                message: "Tüm alanlar zorunludur"
            })
        }

        const clothing = await Clothing.create({
            user: req.user._id,
            image,
            category,
            color,
            style,
            season
        })

        res.status(201).json({
            message: "Kıyafet başarıyla eklendi",
            clothing
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

const getMyClothes = async (req, res) => {
    try {
        const clothes = await Clothing.find({
            user: req.user._id
        }).sort({ createdAt: -1 })

        res.status(200).json({
            message: "Kıyafetler getirildi",
            count: clothes.length,
            clothes
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

module.exports = {
    addClothing,
    getMyClothes
}