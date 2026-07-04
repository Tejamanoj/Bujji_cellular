import { CartItem } from '@/types';
import api from './api';

export const cartService = {
  syncCart: async (items: CartItem[]) => {
    // Production: return (await api.post('/cart/sync', { items })).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  },

  getSavedCart: async () => {
    // Production: return (await api.get('/cart')).data;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return [];
  },
};
