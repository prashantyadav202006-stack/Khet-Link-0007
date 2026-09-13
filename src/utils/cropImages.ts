/**
 * Crop Image Mapping Utility
 * 
 * Maps crop titles, categories, and varieties to accurate Unsplash photos
 * of the actual crop. This ensures that rice shows a rice photo, wheat shows
 * wheat, mustard shows mustard, etc.
 */

interface CropImageMapping {
  keywords: string[];
  imageUrl: string;
}

/**
 * Each entry contains keywords (matched case-insensitively against the crop title,
 * variety, and category) and a curated Unsplash image URL of that actual crop.
 * 
 * Order matters — more specific entries should come first so they match before
 * broader category-level fallbacks.
 */
const CROP_IMAGE_MAP: CropImageMapping[] = [
  // ── RICE / PADDY / BASMATI ──
  {
    keywords: ['rice', 'paddy', 'basmati', 'chawal', 'dhan', 'धान', 'चावल', 'sonamasuri', 'mussori', 'ponni'],
    imageUrl: '/crops/rice.jpg'
    // Golden rice grains close-up
  },

  // ── WHEAT / SHARBATI / GEHUN ──
  {
    keywords: ['wheat', 'sharbati', 'gehun', 'gehu', 'गेहूं', 'गेहू', 'atta'],
    imageUrl: '/crops/wheat.jpg'
    // Wheat field / wheat grains
  },

  // ── MUSTARD / SARSON ──
  {
    keywords: ['mustard', 'sarson', 'sarso', 'सरसों', 'rai'],
    imageUrl: '/crops/mustard.jpg'
    // Mustard seeds
  },

  // ── CHANA / CHICKPEA / GRAM ──
  {
    keywords: ['chana', 'chickpea', 'gram', 'चना', 'kabuli', 'desi chana', 'besan'],
    imageUrl: '/crops/chana.jpg'
    // Chickpeas / chana
  },

  // ── ONION / PYAZ ──
  {
    keywords: ['onion', 'pyaz', 'pyaaz', 'प्याज', 'kanda', 'nashik'],
    imageUrl: '/crops/onion.jpg'
    // Red onions
  },

  // ── TOMATO / TAMATAR ──
  {
    keywords: ['tomato', 'tamatar', 'टमाटर'],
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
    // Fresh tomatoes
  },

  // ── POTATO / ALOO ──
  {
    keywords: ['potato', 'aloo', 'alu', 'आलू'],
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82ber5f7?w=600&auto=format&fit=crop&q=80'
    // Potatoes harvest
  },

  // ── SOYBEAN / SOYA ──
  {
    keywords: ['soybean', 'soya', 'soy', 'सोयाबीन'],
    imageUrl: 'https://images.unsplash.com/photo-1599709606362-9064e1efe058?w=600&auto=format&fit=crop&q=80'
    // Soybeans
  },

  // ── COTTON / KAPAS ──
  {
    keywords: ['cotton', 'kapas', 'कपास', 'shankar'],
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80'
    // Cotton bolls
  },

  // ── CUMIN / JEERA ──
  {
    keywords: ['cumin', 'jeera', 'jira', 'जीरा'],
    imageUrl: 'https://images.unsplash.com/photo-1599909533681-74e2e3b9a0b3?w=600&auto=format&fit=crop&q=80'
    // Cumin seeds
  },

  // ── TUR DAL / ARHAR / PIGEON PEA ──
  {
    keywords: ['tur', 'arhar', 'pigeon pea', 'toor', 'अरहर', 'तुअर'],
    imageUrl: 'https://images.unsplash.com/photo-1612257999756-186adf0a5654?w=600&auto=format&fit=crop&q=80'
    // Lentils / dal
  },

  // ── CHILLI / MIRCH ──
  {
    keywords: ['chilli', 'chili', 'mirch', 'mirchi', 'मिर्च', 'guntur'],
    imageUrl: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=600&auto=format&fit=crop&q=80'
    // Red chillies
  },

  // ── MAIZE / CORN / MAKKA ──
  {
    keywords: ['maize', 'corn', 'makka', 'मक्का', 'bhutta'],
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80'
    // Corn cobs
  },

  // ── SUGARCANE / GANNA ──
  {
    keywords: ['sugarcane', 'ganna', 'गन्ना', 'sugar cane'],
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&auto=format&fit=crop&q=80'
    // Sugarcane field
  },

  // ── GROUNDNUT / PEANUT / MOONGFALI ──
  {
    keywords: ['groundnut', 'peanut', 'moongfali', 'मूंगफली'],
    imageUrl: 'https://images.unsplash.com/photo-1567892320421-1c657571ea4a?w=600&auto=format&fit=crop&q=80'
    // Peanuts
  },

  // ── MUNG / MOONG DAL ──
  {
    keywords: ['moong', 'mung', 'मूंग'],
    imageUrl: 'https://images.unsplash.com/photo-1612257416648-ee7a6c533e4f?w=600&auto=format&fit=crop&q=80'
    // Green moong beans
  },

  // ── TURMERIC / HALDI ──
  {
    keywords: ['turmeric', 'haldi', 'हल्दी'],
    imageUrl: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&auto=format&fit=crop&q=80'
    // Turmeric powder and root
  },

  // ── CORIANDER / DHANIYA ──
  {
    keywords: ['coriander', 'dhaniya', 'धनिया'],
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80'
    // Fresh coriander
  },

  // ── CATEGORY-LEVEL FALLBACKS ──
  {
    keywords: ['grains', 'cereals'],
    imageUrl: '/crops/wheat.jpg'
    // Generic grains (wheat)
  },
  {
    keywords: ['pulses', 'dal', 'lentil', 'दाल'],
    imageUrl: '/crops/chana.jpg'
    // Generic pulses
  },
  {
    keywords: ['vegetables', 'sabzi', 'सब्जी'],
    imageUrl: '/crops/onion.jpg'
    // Fresh vegetables assortment
  },
  {
    keywords: ['oilseeds', 'oil seed', 'तिलहन'],
    imageUrl: '/crops/mustard.jpg'
    // Oilseeds (mustard)
  },
  {
    keywords: ['spices', 'masala', 'मसाला'],
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'
    // Spices assortment
  },
  {
    keywords: ['cash crop', 'cash crops'],
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&auto=format&fit=crop&q=80'
    // Cotton/cash crop
  },
];

/** The ultimate fallback image when no keyword match is found */
const DEFAULT_CROP_IMAGE = '/crops/wheat.jpg';

/**
 * Returns an accurate Unsplash image URL for a given crop, based on its
 * title, variety, and category. Searches keywords case-insensitively.
 * 
 * @param title    — e.g. "Sharbati MP Golden Wheat", "Basmati 1121 Paddy"
 * @param variety  — e.g. "Sehore Sharbati (MP Origin)", "N-53 Dark Red"
 * @param category — e.g. "Grains", "Pulses", "Vegetables"
 * @returns        — A relevant Unsplash image URL
 */
export function getCropImageUrl(
  title?: string,
  variety?: string,
  category?: string
): string {
  const searchText = [title, variety, category]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (!searchText) return DEFAULT_CROP_IMAGE;

  for (const mapping of CROP_IMAGE_MAP) {
    for (const keyword of mapping.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return mapping.imageUrl;
      }
    }
  }

  return DEFAULT_CROP_IMAGE;
}
