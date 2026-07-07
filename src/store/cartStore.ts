import { create } from 'zustand';
import { CartItem, Product } from '@/types';
import { db } from '@/backend/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from './authStore';

interface CartState {
  items: CartItem[];
  coupon: { code: string; discountPercent: number } | null;
  addItem: (product: Product, quantity: number, color: string, storage: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCart: () => Promise<void>;
  syncCart: (userId: string) => Promise<void>;
  getTotals: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    freeShippingProgress: number;
  };
}

const saveCartToDb = async (items: CartItem[]) => {
  const userId = useAuthStore.getState().user?.id;
  if (!userId) return;
  try {
    const docRef = doc(db, 'customers', userId);
    // Map items to plain objects for Firestore
    const plainItems = items.map(item => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        images: item.product.images ?? [],
      },
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      selectedStorage: item.selectedStorage,
    }));
    await updateDoc(docRef, { cart: plainItems });
  } catch (err) {
    console.warn('Failed to save cart to Firestore:', err);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,

  syncCart: async (userId) => {
    try {
      const docRef = doc(db, 'customers', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.cart) {
          set({ items: data.cart });
        }
      }
    } catch (err) {
      console.warn('Failed to sync cart from Firestore:', err);
    }
  },

  addItem: async (product, quantity, color, storage) => {
    const id = `${product.id}_${color.replace('#', '')}_${storage}`;
    const items = get().items;
    const existingIndex = items.findIndex((item) => item.id === id);
    let updatedItems = [];

    if (existingIndex > -1) {
      updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems = [...items, { id, product, quantity, selectedColor: color, selectedStorage: storage }];
    }

    set({ items: updatedItems });
    await saveCartToDb(updatedItems);
  },

  removeItem: async (itemId) => {
    const updatedItems = get().items.filter((item) => item.id !== itemId);
    set({ items: updatedItems });
    await saveCartToDb(updatedItems);
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(itemId);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    );
    set({ items: updatedItems });
    await saveCartToDb(updatedItems);
  },

  applyCoupon: (code) => {
    const uppercaseCode = code.toUpperCase();
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

  clearCart: async () => {
    set({ items: [], coupon: null });
    await saveCartToDb([]);
  },

  getTotals: () => {
    const items = get().items;
    const coupon = get().coupon;

    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
    
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
