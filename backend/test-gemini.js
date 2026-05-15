const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log(data.models.map(m => m.name));
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Hi');
    console.log(result.response.text());
  } catch(e) {
    console.error('Flash error:', e.message);
    try {
      const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result2 = await model2.generateContent('Hi');
      console.log('Pro works:', result2.response.text());
    } catch(e2) {
      console.error('Pro error:', e2.message);
    }
  }
}
run();
