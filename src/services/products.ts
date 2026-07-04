import { Product } from '@/types';
import api from './api';

export const productsService = {
  getProducts: async () => {
    // Production: const res = await api.get('/products'); return res.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return []; // fallback, actual state populated via productStore
  },

  getProductById: async (id: string) => {
    // Production: const res = await api.get(`/products/${id}`); return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return null;
  },

  searchProducts: async (query: string) => {
    // Production: const res = await api.get(`/products/search?q=${query}`); return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [];
  },

  getCategoryProducts: async (category: string) => {
    // Production: const res = await api.get(`/products/category/${category}`); return res.data;
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [];
  },
};
