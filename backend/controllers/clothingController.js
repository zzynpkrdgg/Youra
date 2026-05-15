const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.analyzeClothing = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in the environment' });
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-1.5-flash for image analysis as it is fast and multimodal
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    
    // Parse the JSON. Clean up potential markdown formatting from Gemini response.
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
