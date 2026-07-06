import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Fallback database (instant, no API needed) ───────────────────────────────
const FALLBACK_DB: { [key: string]: any } = {
  'redmi note 9 pro': {
    name: 'Redmi Note 9 Pro',
    brand: 'Xiaomi',
    category: 'smartphones',
    suggestedPriceINR: 13999,
    description: 'Redmi Note 9 Pro sports a powerful Snapdragon 720G processor, 64MP AI Quad Camera, and a massive 5020mAh battery with 18W fast charging.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Interstellar Black', 'Aurora Blue', 'Glacier White'],
    priceConfidence: 'High',
    sourceNote: 'Redmi Official Catalog',
    specs: { Processor: 'Qualcomm Snapdragon 720G', Display: '6.67" IPS LCD (60Hz)', Camera: '64MP + 8MP + 5MP + 2MP', Battery: '5020mAh / 18W Fast Charge', RAM: '6GB', Storage: '128GB' }
  },
  'vivo y17': {
    name: 'Vivo Y17',
    brand: 'Vivo',
    category: 'smartphones',
    suggestedPriceINR: 11990,
    description: 'Vivo Y17 features a 13MP AI Triple Camera, Halo FullView Display, and 5000mAh ultra-large battery.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Mineral Blue', 'Mystic Purple'],
    priceConfidence: 'High',
    sourceNote: 'Vivo Official Catalog',
    specs: { Processor: 'MediaTek Helio P35', Display: '6.35" Halo FullView LCD', Camera: '13MP + 8MP + 2MP', Battery: '5000mAh / 18W', RAM: '4GB', Storage: '128GB' }
  },
  'iphone 15 pro': {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'smartphones',
    suggestedPriceINR: 109900,
    description: 'Apple iPhone 15 Pro features aerospace-grade titanium, A17 Pro chip, Action Button, and a 48MP pro camera system with 5x telephoto.',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'],
    priceConfidence: 'High',
    sourceNote: 'Apple Official Specifications',
    specs: { Processor: 'Apple A17 Pro', Display: '6.1" Super Retina XDR OLED', Camera: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto', Battery: '3274mAh + MagSafe', RAM: '8GB', Storage: '256GB' }
  },
  'iphone 16 pro max': {
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'smartphones',
    suggestedPriceINR: 144900,
    description: 'iPhone 16 Pro Max with A18 Pro Bionic, 6.9" XDR display, 5x Optical Zoom, and 4685mAh battery.',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Desert Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium'],
    priceConfidence: 'High',
    sourceNote: 'Apple Official Specifications',
    specs: { Processor: 'Apple A18 Pro', Display: '6.9" Super Retina XDR OLED', Camera: '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto', Battery: '4685mAh / 25W MagSafe', RAM: '8GB', Storage: '256GB' }
  },
  'samsung galaxy s24 ultra': {
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    category: 'smartphones',
    suggestedPriceINR: 134999,
    description: 'Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, S Pen, and 5000mAh battery — the ultimate Samsung flagship.',
    imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Titanium Black', 'Titanium Gray', 'Titanium Violet', 'Titanium Yellow'],
    priceConfidence: 'High',
    sourceNote: 'Samsung Official',
    specs: { Processor: 'Snapdragon 8 Gen 3', Display: '6.8" QHD+ Dynamic AMOLED 2X (120Hz)', Camera: '200MP Main + 50MP + 10MP + 12MP', Battery: '5000mAh / 45W', RAM: '12GB', Storage: '256GB' }
  },
  'oneplus 12': {
    name: 'OnePlus 12',
    brand: 'OnePlus',
    category: 'smartphones',
    suggestedPriceINR: 64999,
    description: 'OnePlus 12 packs Snapdragon 8 Gen 3, Hasselblad-tuned 50MP cameras, 100W SUPERVOOC charging, and 5400mAh battery.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Silky Black', 'Flowy Emerald'],
    priceConfidence: 'High',
    sourceNote: 'OnePlus Official',
    specs: { Processor: 'Snapdragon 8 Gen 3', Display: '6.82" LTPO 4.0 AMOLED (120Hz)', Camera: '50MP Hasselblad + 64MP Telephoto + 48MP Ultra Wide', Battery: '5400mAh / 100W SUPERVOOC', RAM: '12GB', Storage: '256GB' }
  },
};

// ─── Brand/Category classifier (for Gemini prompt building) ──────────────────
function classifyQuery(query: string) {
  const q = query.toLowerCase();
  let brand = 'Unknown';
  if (q.includes('iphone') || q.includes('apple') || q.includes('airpod') || q.includes('macbook')) brand = 'Apple';
  else if (q.includes('samsung') || q.includes('galaxy')) brand = 'Samsung';
  else if (q.includes('redmi') || q.includes('xiaomi') || q.includes('poco') || q.includes('mi ')) brand = 'Xiaomi';
  else if (q.includes('oneplus')) brand = 'OnePlus';
  else if (q.includes('google') || q.includes('pixel')) brand = 'Google';
  else if (q.includes('vivo')) brand = 'Vivo';
  else if (q.includes('oppo')) brand = 'Oppo';
  else if (q.includes('realme')) brand = 'Realme';
  else if (q.includes('motorola') || q.includes('moto')) brand = 'Motorola';
  else if (q.includes('nokia')) brand = 'Nokia';

  let category = 'smartphones';
  if (q.includes('bud') || q.includes('earbud') || q.includes('headphone') || q.includes('earphone') || q.includes('speaker')) category = 'audio';
  else if (q.includes('watch') || q.includes('band') || q.includes('wearable')) category = 'wearables';
  else if (q.includes('case') || q.includes('cover') || q.includes('charger') || q.includes('cable') || q.includes('adapter')) category = 'accessories';

  return { brand, category };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query?.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase().trim();

    // 1. Check hardcoded fallback DB first (fastest path)
    const exactKey = Object.keys(FALLBACK_DB).find((k) => lowerQuery.includes(k));
    if (exactKey) {
      console.log(`[product-lookup] Serving from fallback DB: ${exactKey}`);
      return NextResponse.json({ result: FALLBACK_DB[exactKey] });
    }

    // 2. Try Gemini AI with Google Search Grounding (real web data)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      console.log(`[product-lookup] Using Gemini web search for: ${query}`);
      try {
        const result = await lookupWithGemini(query, geminiKey);
        if (result) {
          return NextResponse.json({ result });
        }
      } catch (geminiErr: any) {
        console.warn('[product-lookup] Gemini failed, using smart fallback:', geminiErr.message);
      }
    }

    // 3. Smart generative fallback (no API key needed)
    const { brand, category } = classifyQuery(lowerQuery);
    const result = buildSmartFallback(query, brand, category);
    return NextResponse.json({ result });

  } catch (err: any) {
    console.error('[product-lookup] Error:', err);
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}

// ─── Gemini 1.5 Flash with Google Search Grounding ───────────────────────────
async function lookupWithGemini(query: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const MODELS_TO_TRY = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-2.5-flash-latest',
    'gemini-2.5-flash',
  ];

  let lastError: any;

  const prompt = `You are a product database assistant for an Indian mobile phone e-commerce store called "Bujji Cellulars".

Search the web and find accurate, detailed specifications for this product: "${query}"

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "name": "Full official product name",
  "brand": "Brand name (e.g. Apple, Samsung, Xiaomi, etc.)",
  "category": "One of: smartphones, audio, wearables, accessories",
  "suggestedPriceINR": <number - current Indian market retail price in rupees>,
  "description": "2-3 sentence compelling product description for a luxury store",
  "imageUrl": "",
  "suggestedColors": ["Color 1", "Color 2", "...all official colors available"],
  "priceConfidence": "High",
  "sourceNote": "Source website name",
  "specs": {
    "Processor": "...",
    "Display": "...",
    "Camera": "...",
    "Battery": "...",
    "RAM": "...",
    "Storage": "...",
    "OS": "...",
    "5G": "Yes/No",
    "Warranty": "1 Year Manufacturer Warranty"
  }
}

Important rules:
- suggestedPriceINR must be the actual current Indian market price (search for it)
- suggestedColors must list all officially available color variants
- specs must be accurate and complete from official sources
- imageUrl should be empty string "" (we will handle images separately)
- Return ONLY the JSON, nothing else`;

  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`[product-lookup] Trying model: ${modelName}`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        tools: [{ googleSearch: {} }] as any,
      });

      const response = await model.generateContent(prompt);
      const text = response.response.text().trim();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.imageUrl) {
        parsed.imageUrl = getImageForProduct(parsed.brand || '', parsed.category || 'smartphones');
      }

      return parsed;
    } catch (err: any) {
      console.warn(`[product-lookup] Model ${modelName} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini model lookups failed');
}

// ─── Smart fallback (no Gemini key) ──────────────────────────────────────────
function buildSmartFallback(query: string, brand: string, category: string) {
  const formattedName = query.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const BRAND_PRICES: { [key: string]: number } = {
    Apple: 89900, Samsung: 64900, OnePlus: 39999, Google: 54999,
    Xiaomi: 15999, Vivo: 12999, Oppo: 16999, Realme: 14999, Motorola: 13999, Nokia: 11999,
  };

  const BRAND_SPECS: { [key: string]: any } = {
    Apple: {
      Processor: 'Apple A-Series Bionic', Display: '6.1" Super Retina XDR OLED (120Hz)',
      Camera: '48MP Main + 12MP Ultra Wide', Battery: '3200mAh with MagSafe Wireless', RAM: '8GB',
    },
    Samsung: {
      Processor: 'Snapdragon 8 Gen / Exynos', Display: '6.7" Dynamic AMOLED 2X (120Hz)',
      Camera: '108MP AI Camera System', Battery: '4500mAh / 45W Fast Charge', RAM: '8GB',
    },
    OnePlus: {
      Processor: 'Qualcomm Snapdragon 8-Series', Display: '6.7" AMOLED Fluid Display (120Hz)',
      Camera: '50MP Sony Sensor Main + Ultra Wide', Battery: '5000mAh / 100W SUPERVOOC', RAM: '12GB',
    },
    Xiaomi: {
      Processor: 'Snapdragon / MediaTek Dimensity', Display: '6.67" AMOLED 120Hz',
      Camera: '64MP AI Quad Camera', Battery: '5000mAh / 33W Fast Charge', RAM: '8GB',
    },
    Vivo: {
      Processor: 'MediaTek Dimensity / Helio', Display: '6.44" AMOLED 90Hz',
      Camera: '50MP AI Triple Camera', Battery: '4500mAh / 44W FlashCharge', RAM: '8GB',
    },
  };

  const baseSpecs = BRAND_SPECS[brand] || {
    Processor: 'High-Performance Octa-Core', Display: '6.5" AMOLED 120Hz',
    Camera: '50MP AI Triple Camera', Battery: '5000mAh Fast Charge', RAM: '8GB',
  };

  return {
    name: formattedName,
    brand: brand === 'Unknown' ? 'Generic' : brand,
    category,
    suggestedPriceINR: BRAND_PRICES[brand] || 14999,
    description: `${formattedName} — featuring ${baseSpecs.Processor}, ${baseSpecs.Display} display, ${baseSpecs.Camera}, and ${baseSpecs.Battery}. Built for performance with premium design and industry-standard warranty.`,
    imageUrl: getImageForProduct(brand, category),
    suggestedColors: ['Midnight Black', 'Glacier White', 'Phantom Silver'],
    priceConfidence: 'Estimated',
    sourceNote: 'Smart Catalog Prediction — Add GEMINI_API_KEY for live web data',
    specs: {
      ...baseSpecs,
      Storage: '128GB',
      '5G': 'Yes',
      Warranty: '1 Year Manufacturer Warranty',
    },
  };
}

// ─── Image selector ───────────────────────────────────────────────────────────
function getImageForProduct(brand: string, category: string): string {
  if (category === 'audio') return 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80';
  if (category === 'wearables') return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
  if (category === 'accessories') return 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80';

  if (brand === 'Apple') return 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80';
  if (brand === 'Samsung') return 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
}
