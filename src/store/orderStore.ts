import { create } from 'zustand';
import { Order, CartItem, Address } from '@/types';
import {
  createOrder as dbCreateOrder,
  fetchOrdersByCustomer,
  fetchOrderById as dbFetchOrderById,
  updateOrderStatus
} from '@/backend/orders';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  createOrder: (
    customerId: string,
    customerName: string,
    customerEmail: string,
    items: CartItem[],
    totals: { subtotal: number; discount: number; shipping: number; total: number },
    address: Address,
    paymentMethod: string
  ) => Promise<Order | null>;
  fetchOrders: (customerId: string) => void;
  fetchOrderById: (id: string) => Promise<Order | null>;
  cancelOrder: (id: string) => Promise<boolean>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  isLoading: false,

  createOrder: async (customerId, customerName, customerEmail, items, totals, address, paymentMethod) => {
    set({ isLoading: true });
    const res = await dbCreateOrder(customerId, customerName, customerEmail, items, totals, address, paymentMethod);
    if (res.success && res.orderId) {
      const newOrder: Order = {
        id: res.orderId,
        date: new Date().toISOString(),
        status: 'pending',
        items: items.map((item) => ({
          id: item.id,
          product: item.product,
          quantity: item.quantity,
          selectedColor: item.selectedColor ?? '',
          selectedStorage: item.selectedStorage ?? '',
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress: address,
        paymentMethod,
        trackingTimeline: [
          { status: 'Order Placed', date: new Date().toLocaleString(), desc: 'Your order has been submitted.', completed: true },
          { status: 'Processed', date: '', desc: 'Payment verified and items prepared.', completed: false },
          { status: 'Shipped', date: '', desc: 'Awaiting package pickup.', completed: false },
          { status: 'Delivered', date: '', desc: 'Awaiting arrival.', completed: false }
        ],
        invoiceUrl: '#'
      };
      set((state) => ({
        orders: [newOrder, ...state.orders],
        activeOrder: newOrder,
        isLoading: false
      }));
      return newOrder;
    }
    set({ isLoading: false });
    return null;
  },

  fetchOrders: (customerId) => {
    set({ isLoading: true });
    
    if (unsubOrdersList) {
      unsubOrdersList();
    }

    const q = query(
      collection(db, 'orders'),
      where('customerId', '==', customerId)
    );

    unsubOrdersList = onSnapshot(q, (snapshot) => {
      const list: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date,
          status: data.status,
          items: (data.items || []).map((i: any) => ({
            id: i.id,
            product: {
              id: i.productId,
              name: i.productName,
              price: i.price,
              images: [i.productImage],
              originalPrice: i.price,
              description: '',
              rating: 5,
              category: '',
              brand: '',
              colors: [],
              storage: [],
              specs: {},
              reviews: [],
              qa: [],
              stock: 1,
            },
            quantity: i.quantity,
            selectedColor: i.selectedColor,
            selectedStorage: i.selectedStorage,
          })),
          subtotal: data.subtotal,
          discount: data.discount ?? 0,
          shipping: data.shipping ?? 0,
          total: data.total,
          shippingAddress: data.shippingAddress,
          paymentMethod: data.paymentMethod,
          trackingTimeline: data.trackingTimeline ?? [],
          invoiceUrl: data.invoiceUrl ?? '',
        };
      });

      // Sort in memory by date descending
      list.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      set({ orders: list, isLoading: false });
    }, (error) => {
      console.error('Orders subscription error:', error);
      set({ isLoading: false });
    });
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true });
    const order = await dbFetchOrderById(id);
    set({ activeOrder: order, isLoading: false });
    return order;
  },

  cancelOrder: async (id) => {
    set({ isLoading: true });
    const res = await updateOrderStatus(id, 'cancelled');
    if (res.success) {
      set((state) => ({
        orders: state.orders.map((o) => o.id === id ? { ...o, status: 'cancelled' } : o),
        isLoading: false
      }));
      return true;
    }
    set({ isLoading: false });
    return false;
  }
}));

import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/backend/firebase';

let unsubOrdersList: (() => void) | null = null;

