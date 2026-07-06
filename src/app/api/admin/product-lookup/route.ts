import { NextResponse } from 'next/server';

// Mock spec database for instant lookups
const LOOKUP_DATA: { [key: string]: any } = {
  'note 9 pro': {
    name: 'Redmi Note 9 Pro',
    brand: 'Xiaomi',
    category: 'smartphones',
    suggestedPriceINR: 13999,
    description: 'Redmi Note 9 Pro sports a powerful Snapdragon processor, quad camera array, and a massive battery with fast charging.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Interstellar Black', 'Aurora Blue', 'Glacier White'],
    priceConfidence: 'High',
    sourceNote: 'Redmi Catalog Specifications',
    specs: {
      Processor: 'Qualcomm Snapdragon 720G',
      Display: '6.67 inch IPS LCD (60Hz)',
      Camera: '64MP Quad Main + 8MP + 5MP + 2MP',
      Battery: '5020mAh with 18W Fast Charging',
      Storage: '128GB ROM + 6GB RAM'
    }
  },
  'vivo y17': {
    name: 'Vivo Y17',
    brand: 'Vivo',
    category: 'smartphones',
    suggestedPriceINR: 11990,
    description: 'Vivo Y17 features an AI Triple Camera, Halo FullView display, and ultra-large battery capacity with Dual-Engine Fast Charging.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Mineral Blue', 'Mystic Purple'],
    priceConfidence: 'High',
    sourceNote: 'Vivo Catalog Specifications',
    specs: {
      Processor: 'MediaTek Helio P35',
      Display: '6.35 inch Halo FullView LCD',
      Camera: '13MP + 8MP + 2MP AI Triple Camera',
      Battery: '5000mAh with 18W Fast Charging',
      Storage: '128GB ROM + 4GB RAM'
    }
  },
  'iphone 15 pro': {
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    category: 'smartphones',
    suggestedPriceINR: 109900,
    description: 'Apple flagship smartphone featuring aerospace-grade titanium chassis, Action Button, A17 Pro Chip, and advanced Pro camera system.',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Natural Titanium', 'Blue Titanium', 'Black Titanium', 'White Titanium'],
    priceConfidence: 'High',
    sourceNote: 'Apple Official Specifications',
    specs: {
      Processor: 'Apple A17 Pro Chip',
      Display: '6.1 inch Super Retina XDR OLED',
      Camera: '48MP Pro Main + 12MP Ultra Wide + 12MP Telephoto',
      Battery: '3274mAh with MagSafe Wireless Charging',
      Storage: '256GB ROM + 8GB RAM'
    }
  },
  'iphone 16 pro max': {
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    category: 'smartphones',
    suggestedPriceINR: 144900,
    description: 'Flagship Apple smartphone with grade-5 titanium build, custom Action Button, A18 Pro Bionic processor, and 5x optical telephoto lens.',
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80',
    suggestedColors: ['Desert Titanium', 'Natural Titanium', 'White Titanium', 'Black Titanium'],
    priceConfidence: 'High',
    sourceNote: 'Apple Official Specifications',
    specs: {
      Processor: 'Apple A18 Pro Bionic',
      Display: '6.9 inch Super Retina XDR OLED',
      Camera: '48MP Fusion Camera + 48MP Ultra Wide',
      Battery: '4685mAh with 25W MagSafe Fast Charge',
      Storage: '256GB ROM + 8GB RAM'
    }
  }
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const lowerQuery = query.toLowerCase().trim();

    // Check if we have exact match in lookup database
    const exactMatchKey = Object.keys(LOOKUP_DATA).find(k => lowerQuery.includes(k));
    if (exactMatchKey) {
      return NextResponse.json({ result: LOOKUP_DATA[exactMatchKey] });
    }

    // Dynamic specs generator for other products
    let brand = 'Bujji';
    if (lowerQuery.includes('iphone') || lowerQuery.includes('apple') || lowerQuery.includes('airpod') || lowerQuery.includes('macbook')) {
      brand = 'Apple';
    } else if (lowerQuery.includes('samsung') || lowerQuery.includes('galaxy') || lowerQuery.includes('fold') || lowerQuery.includes('flip')) {
      brand = 'Samsung';
    } else if (lowerQuery.includes('redmi') || lowerQuery.includes('xiaomi') || lowerQuery.includes('poco') || lowerQuery.includes('note')) {
      brand = 'Xiaomi';
    } else if (lowerQuery.includes('oneplus')) {
      brand = 'OnePlus';
    } else if (lowerQuery.includes('pixel') || lowerQuery.includes('google')) {
      brand = 'Google';
    } else if (lowerQuery.includes('vivo')) {
      brand = 'Vivo';
    } else if (lowerQuery.includes('oppo')) {
      brand = 'Oppo';
    } else if (lowerQuery.includes('realme')) {
      brand = 'Realme';
    }

    let category = 'smartphones';
    if (lowerQuery.includes('bud') || lowerQuery.includes('earbud') || lowerQuery.includes('audio') || lowerQuery.includes('headphone')) {
      category = 'audio';
    } else if (lowerQuery.includes('watch') || lowerQuery.includes('wearable') || lowerQuery.includes('band')) {
      category = 'wearables';
    } else if (lowerQuery.includes('case') || lowerQuery.includes('cover') || lowerQuery.includes('protector') || lowerQuery.includes('charger') || lowerQuery.includes('adapter')) {
      category = 'accessories';
    }

    const formattedTitle = query.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const description = `Official premium ${brand} ${formattedTitle} featuring advanced mobile technologies, dynamic configurations, and standard brand warranty.`;

    let imageUrl = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'; // Front/back comparison card fallback
    
    if (category === 'smartphones') {
      if (brand === 'Apple') {
        imageUrl = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80';
      } else if (brand === 'Samsung') {
        imageUrl = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80';
      }
    } else if (category === 'audio') {
      imageUrl = 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80';
    } else if (category === 'wearables') {
      imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
    } else if (category === 'accessories') {
      imageUrl = lowerQuery.includes('charger')
        ? 'https://images.unsplash.com/photo-1622445262465-2481c4574875?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80';
    }

    let specs: any = {
      Warranty: '1 Year Manufacturer Warranty'
    };

    let suggestedPriceINR = 14999;

    if (category === 'smartphones') {
      let processor = 'High-Performance Octa-Core';
      let display = 'AMOLED 120Hz Display';
      let camera = '50MP Triple Camera';
      let battery = '5000mAh Battery';

      if (brand === 'Apple') {
        processor = 'Apple A-Series Bionic';
        display = 'Super Retina XDR OLED';
        camera = '48MP Dual Camera System';
        battery = '3200mAh with MagSafe';
        suggestedPriceINR = 79900;
      } else if (brand === 'Samsung') {
        processor = 'Snapdragon 8-Series Gen';
        display = 'Dynamic AMOLED 2X';
        camera = '108MP Zoom Camera';
        battery = '4500mAh with fast charging';
        suggestedPriceINR = 64900;
      } else if (brand === 'Xiaomi') {
        processor = 'MediaTek Dimensity / Snapdragon';
        display = 'IPS LCD / AMOLED 120Hz';
        camera = '64MP Quad Camera';
        battery = '5000mAh with 33W Fast Charge';
        suggestedPriceINR = 15999;
      } else if (brand === 'OnePlus') {
        processor = 'Qualcomm Snapdragon 8 Gen';
        display = 'AMOLED 120Hz Fluid Screen';
        camera = '50MP Sony Sensor Camera';
        battery = '5000mAh with 80W Warp Charge';
        suggestedPriceINR = 39999;
      } else if (brand === 'Vivo') {
        processor = 'Helio / Dimensity Processor';
        display = 'IPS Halo Display';
        camera = '13MP / 50MP AI Dual Camera';
        battery = '5000mAh with Dual-Engine Fast Charge';
        suggestedPriceINR = 12999;
      }

      specs = {
        Processor: processor,
        Display: display,
        Camera: camera,
        Battery: battery,
        Warranty: '1 Year Brand Warranty'
      };
    }

    const suggestedColors = ['Black', 'White', 'Silver'];

    return NextResponse.json({
      result: {
        name: formattedTitle,
        brand,
        category,
        description,
        imageUrl,
        suggestedPriceINR,
        suggestedColors,
        specs,
        priceConfidence: 'Moderate',
        sourceNote: 'Smart Catalog Prediction'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Lookup failed' }, { status: 500 });
  }
}
