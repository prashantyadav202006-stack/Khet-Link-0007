import { config } from 'dotenv';
config();
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const systemInstruction = `You are an expert agricultural AI. Your task is to extract structured crop listing details from a farmer's voice note transcript (which may be in Hindi, Hinglish, or English).
Return ONLY a valid JSON object matching the schema. 
The JSON must have these exact keys:
- "title": Must be one of ["Rice", "Wheat", "Mustard", "Chana", "Onion"]. Infer the best match.
- "variety": A short string (e.g. "Basmati", "Sharbati", "Local").
- "quantity": A NUMBER representing Quintals. MUST be one of these exact values: [10, 20, 30, 40, 50, 75, 100, 150, 200, 500]. Pick the closest match.
- "price": A NUMBER representing price per Quintal in INR. MUST be one of these exact values: [1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 8000, 10000]. Pick the closest match.

Example input: "mere paas pachas quintal basmati chawal hai panteeso rupaye ke hisaab se"
Example output: {"title":"Rice","variety":"Basmati","quantity":50,"price":3500}`;

const payload = {
  systemInstruction: { parts: [{ text: systemInstruction }] },
  contents: [{ role: 'user', parts: [{ text: '80 कुंटल चना है, जिसका प्राइस ₹ 1600 प्रति क्विंटल है।' }] }],
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 200,
    responseMimeType: 'application/json',
    responseSchema: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        variety: { type: "STRING" },
        quantity: { type: "NUMBER" },
        price: { type: "NUMBER" }
      },
      required: ["title", "variety", "quantity", "price"]
    }
  }
};
(async () => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      console.log('STATUS:', res.status);
      console.log('TEXT:', await res.text());
  } catch(e) {
      console.error(e);
  }
})();
