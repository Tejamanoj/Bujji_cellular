import { Order, CartItem, Address } from '@/types';
import api from './api';

export const ordersService = {
  createOrder: async (
    items: CartItem[],
    totals: { subtotal: number; discount: number; shipping: number; total: number },
    address: Address,
    paymentMethod: string
  ) => {
    // Production: return (await api.post('/orders', { items, totals, address, paymentMethod })).data;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {} as Order;
  },

  getOrders: async () => {
    // Production: return (await api.get('/orders')).data;
    await new Promise((resolve) => setTimeout(resolve, 800));
    return [];
  },

  getOrderById: async (id: string) => {
    // Production: return (await api.get(`/orders/${id}`)).data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return null;
  },
};
