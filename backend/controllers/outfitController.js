const { GoogleGenerativeAI } = require('@google/generative-ai');

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
