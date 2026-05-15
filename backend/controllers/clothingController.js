const Clothing = require("../models/Clothing")
const supabase = require("../config/supabase")

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

const uploadClothing = async (req, res) => {
    try {
        const { category, color, style, season } = req.body

        if (!req.file) {
            return res.status(400).json({
                message: "Görsel dosyası zorunludur"
            })
        }

        if (!category || !color || !style || !season) {
            return res.status(400).json({
                message: "Kategori, renk, stil ve sezon zorunludur"
            })
        }

        const fileExt = req.file.originalname.split(".").pop()
        const fileName = `${req.user._id}-${Date.now()}.${fileExt}`
        const filePath = `clothes/${fileName}`

        const { error } = await supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype
            })

        if (error) {
            return res.status(500).json({
                message: "Supabase yükleme hatası",
                error: error.message
            })
        }

        const { data } = supabase.storage
            .from(process.env.SUPABASE_BUCKET)
            .getPublicUrl(filePath)

        const imageUrl = data.publicUrl

        const clothing = await Clothing.create({
            user: req.user._id,
            image: imageUrl,
            category,
            color,
            style,
            season
        })

        res.status(201).json({
            message: "Görsel Supabase'e yüklendi ve kıyafet kaydedildi",
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


const deleteClothing = async (req, res) => {
    try {

        const clothing = await Clothing.findById(req.params.id)

        if (!clothing) {
            return res.status(404).json({
                message: "Kıyafet bulunamadı"
            })
        }

        // Kullanıcı kendi kıyafetini silebilsin
        if (clothing.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Yetkisiz işlem"
            })
        }

        await clothing.deleteOne()

        res.status(200).json({
            message: "Kıyafet silindi"
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

const updateClothing = async (req, res) => {
    try {
        const { category, color, style, season } = req.body

        const clothing = await Clothing.findById(req.params.id)

        if (!clothing) {
            return res.status(404).json({
                message: "Kıyafet bulunamadı"
            })
        }

        if (clothing.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Yetkisiz işlem"
            })
        }

        clothing.category = category || clothing.category
        clothing.color = color || clothing.color
        clothing.style = style || clothing.style
        clothing.season = season || clothing.season

        const updatedClothing = await clothing.save()

        res.status(200).json({
            message: "Kıyafet güncellendi",
            clothing: updatedClothing
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
    uploadClothing,
    getMyClothes,
    deleteClothing,
    updateClothing
}