const Outfit = require("../models/Outfit")
const Clothing = require("../models/Clothing")

const createOutfit = async (req, res) => {
    try {
        const { items, title, occasion, aiSuggestion } = req.body

        if (!title || !items || items.length === 0) {
            return res.status(400).json({
                message: "Başlık ve en az bir kıyafet zorunludur"
            })
        }

        const clothes = await Clothing.find({
            _id: { $in: items },
            user: req.user._id
        })

        if (clothes.length !== items.length) {
            return res.status(400).json({
                message: "Bazı kıyafetler bulunamadı veya sana ait değil"
            })
        }

        const outfit = await Outfit.create({
            user: req.user._id,
            items,
            title,
            occasion,
            aiSuggestion
        })

        res.status(201).json({
            message: "Kombin kaydedildi",
            outfit
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

const getMyOutfits = async (req, res) => {
    try {
        const outfits = await Outfit.find({
            user: req.user._id
        })
            .populate("items")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Kombinler getirildi",
            count: outfits.length,
            outfits
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

const deleteOutfit = async (req, res) => {
    try {
        const outfit = await Outfit.findById(req.params.id)

        if (!outfit) {
            return res.status(404).json({
                message: "Kombin bulunamadı"
            })
        }

        if (outfit.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Yetkisiz işlem"
            })
        }

        await outfit.deleteOne()

        res.status(200).json({
            message: "Kombin silindi"
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

module.exports = {
    createOutfit,
    getMyOutfits,
    deleteOutfit
}