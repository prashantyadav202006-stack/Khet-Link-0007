import { config } from 'dotenv';
config();
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const payload = {
  systemInstruction: { parts: [{ text: 'Return valid JSON. Example: {"title":"Rice","variety":"Basmati","quantity":50,"price":3500}' }] },
  contents: [{ role: 'user', parts: [{ text: 'mere paas 50 quintal basmati chawal hai 3500 rupaye ke hisaab se' }] }],
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 200,
    responseMimeType: 'application/json',
  }
};
(async () => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log('STATUS:', res.status);
  console.log('TEXT:', await res.text());
})();
