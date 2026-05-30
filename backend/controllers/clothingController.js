const { GoogleGenerativeAI } = require('@google/generative-ai');
const Clothing = require("../models/clothing")
const supabase = require("../config/supabase")

exports.analyzeClothing = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the environment' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `Sen bir moda analizi asistanısın. Sana bir kıyafet fotoğrafı göndereceğim. Şu bilgileri JSON formatında döndür:
{ "dominant_colors": ["#hex1", "#hex2"], "style_tags": ["casual", "minimalist"], "season": ["spring", "summer"] }
Sadece geçerli bir JSON döndür, başka hiçbir açıklama yapma. Markdown \`\`\`json\`\`\` tagleri kullanmadan düz metin olarak json objesi döndür.`;

    const imageParts = [
      {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }
    
    const analysis = JSON.parse(cleanedText.trim());

    res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error("Error analyzing clothing:", error);
    res.status(500).json({ success: false, error: 'Kıyafet analizi başarısız oldu', details: error.message });
  }
};

exports.addClothing = async (req, res) => {
    try {
        const { image, category, color, style, season, brand } = req.body

        if (!image || !category || !color || !style || !season) {
            return res.status(400).json({
                message: "Tüm alanlar zorunludur"
            })
        }

        const clothing = await Clothing.create({
            user: req.user._id,
            image,
            category: category.trim(),
            color,
            style,
            season,
            brand
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

exports.uploadClothing = async (req, res) => {
    try {
        const { category, color, style, season, brand } = req.body

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
            category: category.trim(),
            color,
            style,
            season,
            brand
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

exports.getMyClothes = async (req, res) => {
    try {
        const { status } = req.query

        const filter = {
            user: req.user._id
        }

        if (status) {
            if (!["available", "dirty"].includes(status)) {
                return res.status(400).json({
                    message: "Geçersiz status değeri. available veya dirty olmalıdır."
                })
            }

            filter.status = status
        }

        const clothes = await Clothing.find(filter).sort({ createdAt: -1 })

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


exports.deleteClothing = async (req, res) => {
    try {
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

        const imageUrl = clothing.image
        const bucketName = process.env.SUPABASE_BUCKET

        if (imageUrl) {
            const splitText = `/storage/v1/object/public/${bucketName}/`
            const filePath = imageUrl.split(splitText)[1]

            if (filePath) {
                const { error } = await supabase.storage
                    .from(bucketName)
                    .remove([filePath])

                if (error) {
                    return res.status(500).json({
                        message: "Supabase görsel silme hatası",
                        error: error.message
                    })
                }
            }
        }

        await clothing.deleteOne()

        res.status(200).json({
            message: "Kıyafet ve görsel silindi"
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

exports.updateClothing = async (req, res) => {
    try {
        const { category, color, style, season, brand, image, imageUrl, notes } = req.body

        const clothing = await Clothing.findById(req.params.id)

        if (!clothing) {
            return res.status(404).json({ message: "Kıyafet bulunamadı" })
        }

        if (clothing.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Yetkisiz işlem" })
        }

        if (req.file) {
            const fileExt = req.file.originalname.split(".").pop()
            const fileName = `${req.user._id}-${Date.now()}.${fileExt}`
            const filePath = `clothes/${fileName}`

            const { error } = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype
                })

            if (error) {
                return res.status(500).json({ message: "Supabase yükleme hatası", error: error.message })
            }

            const { data } = supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .getPublicUrl(filePath)
            
            clothing.image = data.publicUrl
        } else if (image && !image.startsWith('blob:')) {
            clothing.image = image
        }

        clothing.category = (category && category.trim()) || clothing.category
        clothing.color = color || clothing.color
        clothing.style = style || clothing.style
        clothing.season = season || clothing.season
        clothing.brand = brand || clothing.brand
        if (imageUrl !== undefined) clothing.image = imageUrl
        if (notes !== undefined) clothing.notes = notes

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

exports.updateClothingStatus = async (req, res) => {
    try {
        const { status } = req.body

        if (!status || !["available", "dirty"].includes(status)) {
            return res.status(400).json({
                message: "Status değeri available veya dirty olmalıdır"
            })
        }

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

        clothing.status = status

        const updatedClothing = await clothing.save()

        res.status(200).json({
            message: status === "dirty"
                ? "Kıyafet kirli sepetine taşındı"
                : "Kıyafet tekrar kullanıma hazır",
            clothing: updatedClothing
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}