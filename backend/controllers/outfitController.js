const { GoogleGenerativeAI } = require('@google/generative-ai');
const Outfit = require("../models/outfit")
const Clothing = require("../models/clothing")

exports.generateOutfit = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Istek govdesi (body) eksik veya JSON formatinda degil.' });
    }
    const { message, styles, wardrobe, items, mode } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe)) {
      return res.status(400).json({ error: 'wardrobe is required and must be an array' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the environment' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Simplify wardrobe representation to save tokens
    const simpleWardrobe = wardrobe.map(w => ({
      _id: w._id,
      name: w.name,
      category: w.category,
      color: w.color,
      style: w.style || w.season || ''
    }));

    const systemPrompt = `Sen bir kişisel stil danışmanısın. Kullanıcının dijital gardırobunu analiz ederek en uygun kombinleri öneriyorsun.

Kullanıcının tercih ettiği tarzlar: ${styles && styles.length > 0 ? styles.join(', ') : 'Belirtilmemiş'}

Gardırobu şu kıyafetlerden oluşuyor (JSON listesi):
${JSON.stringify(simpleWardrobe, null, 2)}

Lütfen çıktını SADECE aşağıdaki JSON formatında ver.
{
  "suggested_outfit": ["kıyafet_id_1", "kıyafet_id_2"],
  "explanation": "Kombin açıklaması (Neden bu parçaları seçtin, nasıl tamamlıyor vb.)"
}
ÖNEMLİ: "suggested_outfit" dizisi sadece string ID'lerden (\`_id\`) oluşmalıdır. Açıklamanı samimi ve kısa tut. Markdown \`\`\`json tagi koymadan sadece JSON dön.`;

    const userPrompt = `Kullanıcının hali hazırda seçtiği parçalar: ${JSON.stringify(items || [])}
Kullanıcının isteği: "${message || 'Bana rastgele güzel bir kombin öner.'}"
Mod: ${mode === 'tamamla' ? 'Kullanıcının seçtiği parçalara dolaptan uygun parçalar ekleyerek tamamla.' : 'Dolaptan tamamen yeni, sıfırdan bir kombin oluştur.'}`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const responseText = result.response.text();
    
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) cleanedText = cleanedText.substring(7);
    else if (cleanedText.startsWith('```')) cleanedText = cleanedText.substring(3);
    if (cleanedText.endsWith('```')) cleanedText = cleanedText.slice(0, -3);

    const outfitSuggestion = JSON.parse(cleanedText.trim());

    res.status(200).json({
      success: true,
      data: outfitSuggestion
    });

  } catch (error) {
    console.error("Error generating outfit:", error);
    res.status(500).json({ success: false, error: 'Kombin oluşturma başarısız oldu', details: error.message });
  }
};

exports.chatOutfit = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: "Mesaj eksik" });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let prompt = `Sen Youra isimli bir moda ve stil asistanısın. Kullanıcının sorusuna samimi ve yardımcı bir dille cevap ver.\n\n`;
    if (history && history.length > 0) {
      prompt += "Geçmiş konuşmalar:\n" + history.map(h => `${h.role === 'user' ? 'Kullanıcı' : 'Sen'}: ${h.content}`).join('\n') + "\n\n";
    }
    prompt += `Kullanıcı: ${message}\nSen:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Yapay zeka yanıt veremedi. Hata: " + error.message });
  }
};

exports.createOutfit = async (req, res) => {
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

exports.getMyOutfits = async (req, res) => {
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

exports.deleteOutfit = async (req, res) => {
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

exports.toggleFavoriteOutfit = async (req, res) => {
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

        outfit.isFavorite = !outfit.isFavorite

        const updatedOutfit = await outfit.save()

        res.status(200).json({
            message: updatedOutfit.isFavorite
                ? "Kombin favorilere eklendi"
                : "Kombin favorilerden çıkarıldı",
            outfit: updatedOutfit
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

exports.updateOutfit = async (req, res) => {
    try {
        const { title, occasion, notes, items } = req.body

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

        outfit.title = title || outfit.title
        outfit.occasion = occasion || outfit.occasion
        if (notes !== undefined) outfit.notes = notes
        if (items !== undefined) outfit.items = items

        const updatedOutfit = await outfit.save()

        res.status(200).json({
            message: "Kombin güncellendi",
            outfit: updatedOutfit
        })

    } catch (error) {
        res.status(500).json({
            message: "Sunucu hatası",
            error: error.message
        })
    }
}

exports.getFavoriteOutfits = async (req, res) => {
    try {
        const outfits = await Outfit.find({
            user: req.user._id,
            isFavorite: true
        })
            .populate("items")
            .sort({ createdAt: -1 })

        res.status(200).json({
            message: "Favori kombinler getirildi",
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
