import { create } from 'zustand';
import { Product } from '@/types';
import { fetchAllCategories, Category } from '@/backend/categories';
import { db } from '@/backend/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';

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
  categories: Category[];
  selectedProduct: Product | null;
  quickViewProduct: Product | null;
  filters: Filters;
  isLoading: boolean;
  isLoaded: boolean;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  setQuickViewProduct: (product: Product | null) => void;
  setSelectedProduct: (product: Product | null) => void;
  getFilteredProducts: () => Product[];
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

const initialFilters: Filters = {
  category: 'all',
  priceRange: [0, 2000],
  brands: [],
  rating: 0,
  search: '',
  sortBy: 'featured',
};

let unsubProducts: (() => void) | null = null;

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  quickViewProduct: null,
  filters: initialFilters,
  isLoading: false,
  isLoaded: false,

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

  fetchProducts: async () => {
    if (get().isLoaded) return;
    set({ isLoading: true });
    
    // Fetch categories static data
    const cats = await fetchAllCategories();
    set({ categories: cats });

    // Establish real-time products collection query listener
    if (unsubProducts) {
      unsubProducts();
    }

    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    unsubProducts = onSnapshot(q, (snapshot) => {
      const items: Product[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          price: data.price,
          originalPrice: data.originalPrice,
          description: data.description,
          rating: data.rating ?? 0,
          images: data.images ?? [],
          category: data.category,
          brand: data.brand,
          colors: data.colors ?? [],
          storage: data.storage ?? [],
          specs: data.specs ?? {},
          reviews: data.reviews ?? [],
          qa: data.qa ?? [],
          stock: data.stock ?? 0,
          featured: data.featured ?? false,
          flashSale: data.flashSale ?? false,
          thumbnails: data.thumbnails ?? [],
          highlights: data.highlights ?? [],
          videos: data.videos ?? [],
          accessoryIds: data.accessoryIds ?? [],
          relatedIds: data.relatedIds ?? [],
        };
      });
      set({ products: items, isLoading: false, isLoaded: true });
    }, (error) => {
      console.error('Products listener error:', error);
      set({ isLoading: false });
    });
  },

  fetchCategories: async () => {
    const list = await fetchAllCategories();
    set({ categories: list });
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
