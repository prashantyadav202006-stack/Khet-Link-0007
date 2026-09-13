/**
 * KhetLink Gemini Live Integration Service
 * Connects KhetAI Sahayak to Google Gemini models for live, context-aware agricultural AI.
 */

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

/**
 * Retrieves the Gemini API key from environment variables or localStorage
 */
export function getGeminiApiKey(): string {
  // 1. Check Vite env variables
  const envKey = 
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)) ||
    '';

  if (typeof envKey === 'string' && envKey && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey.trim();
  }

  // 2. Check browser localStorage in case user entered it via in-app settings
  if (typeof window !== 'undefined') {
    const localKey = localStorage.getItem('khetlink_gemini_api_key');
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
  }

  return '';
}

/**
 * Saves a user-provided Gemini API key to localStorage for instant browser live testing
 */
export function saveGeminiApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('khetlink_gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('khetlink_gemini_api_key');
    }
  }
}

/**
 * Checks if a live Gemini API key is configured
 */
export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 10;
}

export interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

/**
 * Construct domain-specific system instruction for KhetAI Sahayak
 */
function buildSystemInstruction(language: string = 'hi'): string {
  // If language is explicitly pa, mr, or te, use that language; OTHERWISE DEFAULT TO HINDI (हिन्दी)
  let targetLang = 'Hindi (हिन्दी in authentic Devanagari script)';
  if (language === 'pa') {
    targetLang = 'Punjabi (ਪੰਜਾਬੀ in Gurmukhi script)';
  } else if (language === 'mr') {
    targetLang = 'Marathi (मराठी in Devanagari script)';
  } else if (language === 'te') {
    targetLang = 'Telugu (తెలుగు)';
  } else {
    // Default to Hindi even if the user typed in English or Hinglish
    targetLang = 'Hindi (हिन्दी in authentic Devanagari script)';
  }

  return `You are "KhetAI Sahayak" (खेत-एआई सहायक), the intelligent direct farmgate and mandi advisor on KhetLink.

About KhetLink:
- KhetLink is a direct Farmer/FPO to Bulk Buyer Marketplace (built for Smart India Hackathon SIH 2026).
- Mission: Eliminate unorganized mandi middlemen (dalals/arhtiyas), save up to 18% in procurement commissions, and pass savings directly to farmers and institutional buyers (hostel messes, canteens, wholesalers).
- Key Features:
  1. 0% APMC Cess / Section 43 direct procurement exemption.
  2. NABL Digital Quality Assaying & Agmark moisture grading for transparent quality locks.
  3. 100% Escrow Protection with automated T+0 instant bank DBT payout to farmers upon electronic weighbridge delivery verification.
  4. FPO collective aggregation for smallholders (< 5 acres) pooling produce into 20-ton truckloads.
  5. AI Price and Demand Forecasting (guiding farmers on when to sell vs. warehouse).

IMPORTANT LANGUAGE INSTRUCTION:
- You MUST answer in ${targetLang} BY DEFAULT.
- Even if the user asks their question in English or Hinglish, answer in clear, polite Hindi (हिन्दी) in Devanagari script (unless the user explicitly says "reply in English").
- Use respectful, authentic agricultural terminology (जैसे: किसान भाई/बहन, राम-राम / नमस्ते, मंडी भाव, न्यूनतम समर्थन मूल्य (MSP), एफपीओ, क्विंटल, ई-बिल्टी, आधार डीबीटी, ई-वे बिल).
- Style: Direct, practical, concise, formatted with clear markdown bullet points and emojis.
- Scope: Assist with mandi prices, crop advisory, MSP benchmarks, hostel/mess bulk buying, logistics, quality assaying, and escrow payments.
- If asked about mandi rates, reference realistic prevailing spot market rates across Indian states (Punjab, Haryana, MP, Maharashtra, Rajasthan, UP).
- Never give harmful pesticide recommendations. Keep food safety and organic practices in focus.`;
}

/**
 * Queries Google Gemini Live API
 */
export async function queryGeminiLive(
  userQuery: string,
  history: ChatHistoryMessage[] = [],
  language: string = 'en'
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const systemInstruction = buildSystemInstruction(language);

  // Prepare multi-turn messages
  const contents = [
    ...history.slice(-8).map((msg) => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    {
      role: 'user',
      parts: [{ text: userQuery }]
    }
  ];

  const payload = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      topP: 0.95
    }
  };

  // Try primary model first (gemini-3.6-flash), then fallbacks
  const modelsToTry = GEMINI_MODELS;
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(errMsg);
      }

      const data = await res.json();
      const candidate = data.candidates?.[0];
      const textResponse = candidate?.content?.parts?.[0]?.text;

      if (textResponse && textResponse.trim()) {
        return textResponse.trim();
      } else {
        throw new Error('Empty response received from Gemini API');
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} attempt notice:`, err?.message || err);
      // continue to fallback model
    }
  }

  throw lastError || new Error('Failed to query Gemini API');
}

/**
 * Parses a raw voice transcript from a farmer into structured crop listing data
 */
export async function parseVoiceListing(transcript: string): Promise<{
  title: string;
  variety: string;
  quantity: number;
  price: number;
}> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  const systemInstruction = `You are an expert agricultural AI. Your task is to extract structured crop listing details from a farmer's voice note transcript (which may be in Hindi, Hinglish, or English).
Return ONLY a valid JSON object with no markdown formatting or backticks. 
The JSON must have these exact keys:
- "title": Must be one of ["Rice", "Wheat", "Mustard", "Chana", "Onion"]. Infer the best match.
- "variety": A short string (e.g. "Basmati", "Sharbati", "Local"). If unknown, use "Standard".
- "quantity": A NUMBER representing Quintals. If they say words like "pachas" convert to 50. If they say "tons", multiply by 10. If not mentioned, use 50.
- "price": A NUMBER representing price per Quintal in INR. Convert words like "panteeso" to 3500. If not mentioned, use 3000.

Example input: "mere paas pachas quintal basmati chawal hai panteeso rupaye ke hisaab se"
Example output: {"title":"Rice","variety":"Basmati","quantity":50,"price":3500}`;

  const payload = {
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: transcript }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 200,
      responseMimeType: "application/json",
    }
  };

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) continue;

      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        // Strip out any markdown code blocks if the model accidentally included them
        const cleaned = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('Voice parsing attempt failed:', err);
    }
  }
  
  throw new Error('Failed to parse voice listing');
}
