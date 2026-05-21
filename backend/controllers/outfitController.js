const { GoogleGenerativeAI } = require('@google/generative-ai');
const Outfit = require("../models/outfit")
const Clothing = require("../models/clothing")

exports.generateOutfit = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Istek govdesi (body) eksik veya JSON formatinda degil.' });
    }
    const { message, styles, wardrobe, items, mode, weather } = req.body;

    if (!wardrobe || !Array.isArray(wardrobe)) {
      return res.status(400).json({ error: 'wardrobe is required and must be an array' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the environment' });
    }

    // Hava durumu açıklaması oluştur
    let weatherDescription = '';
    if (weather && weather.temperature !== undefined) {
      const temp = weather.temperature;
      const code = weather.weathercode;
      
      let weatherStatus = 'Açık hava';
      let weatherAdvice = '';
      
      if (code === 0) {
        weatherStatus = 'Açık ve güneşli';
        weatherAdvice = 'Güneş ışınlarından koruna, sunglasses ve şapka kullan.';
      } else if (code >= 1 && code <= 3) {
        weatherStatus = 'Bulutlu';
        weatherAdvice = 'Hafif bir dış giyim katar.';
      } else if (code === 45 || code === 48) {
        weatherStatus = 'Sisli';
        weatherAdvice = 'Görünürlüğü artırmak için açık renkler tercih et.';
      } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        weatherStatus = 'Yağmurlu';
        weatherAdvice = '⚠️ Şemsiyeni ve su geçirmez ceketini almayı UNUTMA!';
      } else if (code >= 71 && code <= 77) {
        weatherStatus = 'Karlı';
        weatherAdvice = '❄️ Kalın katlı giyim ve su geçirmez ayakkabı giyin!';
      } else if (code === 85 || code === 86) {
        weatherStatus = 'Karla karışık yağmur';
        weatherAdvice = '⚠️ Su geçirmez, sıcak ve kalın giysiler gerekli!';
      } else if (code >= 95 && code <= 99) {
        weatherStatus = 'Fırtınalı';
        weatherAdvice = '⚠️ GÜVENLI ve ağır giyimler öner! Dış giyime dikkat et.';
      }
      
      weatherDescription = `\nHava Durumu: ${weatherStatus}, ${temp}°C
${weatherAdvice}`;
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

    const systemPrompt = `Sen profesyonel bir kişisel stil ve dijital gardırop asistanısın. Sadece kombin önerileri yapmak ve kullanıcının stiliyle ilgilenmek üzere programlandın.

Kullanıcının tercih ettiği tarzlar: ${styles && styles.length > 0 ? styles.join(', ') : 'Belirtilmemiş'}

Gardırobu şu kıyafetlerden oluşuyor (JSON listesi):
${JSON.stringify(simpleWardrobe, null, 2)}

KURALLAR:
1. Çıktını SADECE JSON formatında ver. Başında veya sonunda markdown (\`\`\`json) KULLANMA.
2. Açıklamanı (explanation) ÇOK KISA, net ve profesyonel tut (Maksimum 1-2 cümle). Kullanıcı seçtiğin kıyafetleri zaten ekranda görecek, o yüzden uzun uzun parçaları betimleme. Sadece kombinin genel uyumunu veya hissiyatını özetle.
3. Eğer kullanıcı moda ve kombin dışında tamamen alakasız bir soru sorarsa (Örn: "Nasılsın?", "Hava nasıl?"), "suggested_outfit" dizisini BOŞ BIRAK ve "explanation" kısmına sadece şunu yaz: "Ben profesyonel bir stil asistanıyım. Sadece gardırobunuzla ilgili kombin oluşturma konusunda yardımcı olabilirim." Asla alakasız sohbetlere girme.

Beklenen JSON Formatı:
{
  "suggested_outfit": ["kıyafet_id_1", "kıyafet_id_2"],
  "explanation": "Kombin açıklaması veya uyarı mesajı"
}`;

    const userPrompt = `Kullanıcının hali hazırda seçtiği parçalar: ${JSON.stringify(items || [])}
Kullanıcının isteği: "${message || 'Bana rastgele güzel bir kombin öner.'}"
Mod: ${mode === 'tamamla' ? 'Kullanıcının seçtiği parçalara dolaptan uygun parçalar ekleyerek tamamla.' : 'Dolaptan tamamen yeni, sıfırdan bir kombin oluştur.'}${weatherDescription}`;

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
