const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateOutfit = async (req, res) => {
  try {
    const { user_message, user_style_preferences, wardrobe_items, pinned_items } = req.body;

    if (!wardrobe_items || !Array.isArray(wardrobe_items)) {
      return res.status(400).json({ error: 'wardrobe_items is required and must be an array' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the environment' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash for fast text generation
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `Sen bir kişisel stil danışmanısın. Kullanıcının dijital gardırobunu analiz ederek en uygun kombinleri öneriyorsun.

Kullanıcının tercih ettiği tarzlar: ${user_style_preferences && user_style_preferences.length > 0 ? user_style_preferences.join(', ') : 'Belirtilmemiş'}

Gardırobu şu kıyafetlerden oluşuyor (JSON listesi):
${JSON.stringify(wardrobe_items, null, 2)}

Kombin önerirken şunlara dikkat et:
- Renk uyumunu göz önünde bulundur.
- Kullanıcının tarz tercihlerine sadık kal.
- Kombinleri giyim katmanlarına göre (üst, alt, dış giyim, aksesuar) mantıklı bir şekilde organize et.

Lütfen çıktını JSON formatında ver. Örnek çıktı:
{
  "outfit": [
    { "id": "item1", "category": "tişört", "color": "#123456", "reason": "Rahatlık ve temel bir katman sağlamak için." }
  ],
  "explanation": "Genel kombin açıklaması..."
}
Sadece geçerli bir JSON döndür, başka hiçbir açıklama yapma.`;

    const userPrompt = `Kullanıcının özellikle seçtiği parçalar: ${JSON.stringify(pinned_items || [])}
Kullanıcının isteği: "${user_message || 'Bana rastgele güzel bir kombin öner.'}"

Bu bilgilere dayanarak gardıroptaki diğer parçaları da kullanarak komple bir kombin oluştur. Eğer gardıropta yeterli parça yoksa veya eşleşmiyorsa olanlarla yapabileceğinin en iyisini yap.`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const responseText = result.response.text();
    
    // Parse the JSON output and handle potential markdown ticks
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.substring(7);
    } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.substring(3);
    }
    if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
    }

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
