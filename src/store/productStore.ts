import { create } from 'zustand';
import { Product } from '@/types';

interface Filters {
  category: string;
  priceRange: [number, number];
  brands: string[];
  rating: number;
  search: string;
  sortBy: 'featured' | 'price-low-high' | 'price-high-low' | 'rating';
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  getFilteredProducts: () => Product[];
}

const initialFilters: Filters = {
  category: 'all',
  priceRange: [0, 2000],
  brands: [],
  rating: 0,
  search: '',
  sortBy: 'featured',
};

const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Bujji Gold-Phantom Smartphone',
    price: 1299,
    originalPrice: 1499,
    description: 'A futuristic smartphone with a full liquid metal gold body, transparent backing, integrated holographic UI, and an elite 200MP camera system.',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smartphones',
    brand: 'Bujji',
    colors: ['#D4AF37', '#0A0A0A', '#E5E5E5'],
    storage: ['256GB', '512GB', '1TB'],
    specs: {
      Processor: 'Bujji Quantum Octa-Core',
      Camera: '200MP Triple Lens with Gold Laser Focus',
      Display: '6.8 inch 144Hz Holographic OLED',
      Battery: '5500mAh Solid State with 120W Charging',
    },
    reviews: [
      { id: 'r1', author: 'Alex Rivera', rating: 5, comment: 'Absolutely stunning gold chassis! The speed is out of this world.', date: '2026-06-15' },
      { id: 'r2', author: 'Sophia Vance', rating: 5, comment: 'The holographic UI is like nothing else. Worth every single cent.', date: '2026-06-20' },
    ],
    qa: [
      { id: 'q1', question: 'Does the gold finish scratch easily?', answer: 'No, it features a special diamond-like carbon (DLC) protective layer over the gold plating.' },
    ],
    stock: 12,
    featured: true,
    flashSale: true,
  },
  {
    id: 'prod_2',
    name: 'AeroBuds Gold Premium Edition',
    price: 249,
    originalPrice: 299,
    description: 'Ultra-lightweight active noise-cancelling wireless earbuds featuring gold-plated acoustic sound tubes and deep high-fidelity acoustics.',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'audio',
    brand: 'Bujji',
    colors: ['#D4AF37', '#111111'],
    storage: ['Standard'],
    specs: {
      Drivers: '11mm Gold-Plated Dynamic Drivers',
      BatteryLife: '45 Hours total with case',
      NoiseCancellation: 'Up to 50dB Hybrid ANC',
      Waterproofing: 'IPX5 Sweat resistance',
    },
    reviews: [
      { id: 'r3', author: 'Markus Chen', rating: 5, comment: 'Rich bass, gold look is very executive.', date: '2026-06-10' },
    ],
    qa: [
      { id: 'q2', question: 'Are these compatible with iPhones?', answer: 'Yes, they pair instantly via Bluetooth 5.4 with iOS, Android, and Windows.' },
    ],
    stock: 45,
    featured: true,
    flashSale: false,
  },
  {
    id: 'prod_3',
    name: 'Nothing Phone (3) Dark Cyber',
    price: 799,
    description: 'Futuristic smartphone with custom glyph light interface, semi-transparent matte black panel, and golden ambient glows.',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smartphones',
    brand: 'Nothing',
    colors: ['#1A1A1A', '#D4AF37'],
    storage: ['128GB', '256GB'],
    specs: {
      Display: '6.7 inch Flexible LTPO OLED',
      Interface: 'Glyph Lights Version 3',
      OS: 'Nothing OS 3.0 (Android 15)',
    },
    reviews: [],
    qa: [],
    stock: 25,
    featured: false,
    flashSale: true,
  },
  {
    id: 'prod_4',
    name: 'Bujji Chronos Premium Smartwatch',
    price: 499,
    originalPrice: 599,
    description: 'A state-of-the-art smartwatch crafted with a brushed gold titanium case and premium ceramic bezel. Tracks bio-signals, blood oxygen, and energy levels.',
    rating: 4.9,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'audio',
    brand: 'Bujji',
    colors: ['#D4AF37', '#0A0A0A'],
    storage: ['Standard'],
    specs: {
      Case: '45mm Gold Titanium Alloy',
      Sensors: 'ECG, SpO2, Heart-rate, Bio-impedance',
      Battery: 'Up to 7 Days in Premium Mode',
    },
    reviews: [],
    qa: [],
    stock: 18,
    featured: true,
    flashSale: false,
  },
  {
    id: 'prod_5',
    name: 'MagSafe CyberGold Power Bank',
    price: 89,
    description: '15W MagSafe-compatible power bank with a carbon fiber casing and high-brightness gold LED fuel display.',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1609592424109-dd9892f1b17c?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'power-chargers',
    brand: 'Bujji',
    colors: ['#D4AF37', '#333333'],
    storage: ['10,000mAh'],
    specs: {
      Capacity: '10,000mAh',
      WirelessCharging: '15W MagSafe certified',
      WiredOutput: '30W USB-C Power Delivery',
    },
    reviews: [],
    qa: [],
    stock: 120,
    featured: false,
    flashSale: false,
  },
  {
    id: 'prod_6',
    name: 'Gold Armor Heavy-Duty MagCase',
    price: 59,
    description: 'Extreme military-grade shock protection case with gold anodized aluminum reinforcement bumpers.',
    rating: 4.8,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'protection',
    brand: 'Bujji',
    colors: ['#D4AF37', '#000000'],
    storage: ['iPhone 15 Pro', 'iPhone 15 Pro Max', 'Galaxy S24 Ultra'],
    specs: {
      DropProtection: 'Up to 15 feet',
      Materials: 'Gold Anodized Aluminum + TPU Bumpers',
    },
    reviews: [],
    qa: [],
    stock: 200,
    featured: false,
    flashSale: false,
  },
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: mockProducts,
  selectedProduct: null,
  quickViewProduct: null,
  filters: initialFilters,

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  resetFilters: () => {
    set({ filters: initialFilters });
  },

  setQuickViewProduct: (product) => {
    set({ quickViewProduct: product });
  },

  setSelectedProduct: (product) => {
    set({ selectedProduct: product });
  },

  getFilteredProducts: () => {
    const { products, filters } = get();
    let filtered = [...products];

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Brands filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter((p) => p.rating >= filters.rating);
    }

    // Search filter
    if (filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.brand.toLowerCase().includes(searchLower)
      );
    }

    // Sort order
    if (filters.sortBy === 'price-low-high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high-low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  },
}));
