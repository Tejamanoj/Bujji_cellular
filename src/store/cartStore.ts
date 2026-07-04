import { create } from 'zustand';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  coupon: { code: string; discountPercent: number } | null;
  addItem: (product: Product, quantity: number, color: string, storage: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    freeShippingProgress: number;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,

  addItem: (product, quantity, color, storage) => {
    const id = `${product.id}_${color.replace('#', '')}_${storage}`;
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.id === id);

    if (existingIndex > -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      set({ items: updatedItems });
    } else {
      set({
        items: [...items, { id, product, quantity, selectedColor: color, selectedStorage: storage }],
      });
    }
  },

  removeItem: (itemId) => {
    set({
      items: get().items.filter((item) => item.id !== itemId),
    });
  },

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
    });
  },

  applyCoupon: (code) => {
    const uppercaseCode = code.toUpperCase();
    // Pre-defined premium coupons
    const coupons: { [key: string]: number } = {
      BUJJI10: 10,
      GOLD20: 20,
      PREMIUM30: 30,
    };

    if (coupons[uppercaseCode]) {
      set({ coupon: { code: uppercaseCode, discountPercent: coupons[uppercaseCode] } });
      return true;
    }
    return false;
  },

  removeCoupon: () => set({ coupon: null }),

  clearCart: () => set({ items: [], coupon: null }),

  getTotals: () => {
    const items = get().items;
    const coupon = get().coupon;

    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
    
    // Free shipping if subtotal after discount is > ?150
    const netTotalBeforeShipping = subtotal - discount;
    const freeShippingThreshold = 150;
    const shipping = netTotalBeforeShipping > freeShippingThreshold || netTotalBeforeShipping === 0 ? 0 : 15;
    
    const total = netTotalBeforeShipping + shipping;
    
    const freeShippingProgress = Math.min((netTotalBeforeShipping / freeShippingThreshold) * 100, 100);

    return {
      subtotal,
      discount,
      shipping,
      total,
      freeShippingProgress,
    };
  },
}));
