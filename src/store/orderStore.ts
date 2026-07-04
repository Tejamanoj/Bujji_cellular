import { create } from 'zustand';
import { Order, CartItem, Address } from '@/types';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  createOrder: (
    items: CartItem[],
    totals: { subtotal: number; discount: number; shipping: number; total: number },
    address: Address,
    paymentMethod: string
  ) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  cancelOrder: (id: string) => Promise<boolean>;
}

const mockOrders: Order[] = [
  {
    id: 'ord_98721',
    date: '2026-06-20T10:30:00Z',
    status: 'delivered',
    items: [
      {
        id: 'prod_2_111111_Standard',
        product: {
          id: 'prod_2',
          name: 'AeroBuds Gold Premium Edition',
          price: 249,
          description: 'Wireless earbuds',
          rating: 4.8,
          images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'],
          category: 'audio',
          brand: 'Bujji',
          colors: ['#D4AF37'],
          storage: ['Standard'],
          specs: {},
          reviews: [],
          qa: [],
          stock: 20
        },
        quantity: 1,
        selectedColor: '#D4AF37',
        selectedStorage: 'Standard'
      }
    ],
    subtotal: 249,
    discount: 0,
    shipping: 0,
    total: 249,
    shippingAddress: {
      id: 'addr_1',
      name: 'Teja M',
      street: '100 Golden Boulevard, Suite 500',
      city: 'Metropolis',
      state: 'NY',
      zip: '10001',
      phone: '+1 555-0199',
      isDefault: true
    },
    paymentMethod: 'Visa ending in 4242',
    trackingTimeline: [
      { status: 'Order Placed', date: 'June 20, 2026 10:30 AM', desc: 'Your order was successfully submitted.', completed: true },
      { status: 'Processed', date: 'June 20, 2026 01:15 PM', desc: 'Payment verified and items prepared.', completed: true },
      { status: 'Shipped', date: 'June 21, 2026 08:00 AM', desc: 'Carrier picked up. Tracking #BUJ-98218-GOLD', completed: true },
      { status: 'Delivered', date: 'June 23, 2026 04:45 PM', desc: 'Package signed for by resident.', completed: true }
    ],
    invoiceUrl: '/invoices/invoice-98721.pdf'
  },
  {
    id: 'ord_98762',
    date: '2026-06-25T14:22:00Z',
    status: 'processing',
    items: [
      {
        id: 'prod_1_D4AF37_512GB',
        product: {
          id: 'prod_1',
          name: 'Bujji Gold-Phantom Smartphone',
          price: 1299,
          description: 'Holographic phone',
          rating: 4.9,
          images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80'],
          category: 'smartphones',
          brand: 'Bujji',
          colors: ['#D4AF37'],
          storage: ['512GB'],
          specs: {},
          reviews: [],
          qa: [],
          stock: 5
        },
        quantity: 1,
        selectedColor: '#D4AF37',
        selectedStorage: '512GB'
      }
    ],
    subtotal: 1299,
    discount: 129.9,
    shipping: 0,
    total: 1169.1,
    shippingAddress: {
      id: 'addr_1',
      name: 'Teja M',
      street: '100 Golden Boulevard, Suite 500',
      city: 'Metropolis',
      state: 'NY',
      zip: '10001',
      phone: '+1 555-0199',
      isDefault: true
    },
    paymentMethod: 'Crypto Wallet Payment',
    trackingTimeline: [
      { status: 'Order Placed', date: 'June 25, 2026 02:22 PM', desc: 'Order received. Cryptographic verification pending.', completed: true },
      { status: 'Processed', date: 'June 25, 2026 03:00 PM', desc: 'Verification confirmed. Allocated inventory.', completed: true },
      { status: 'Shipped', date: '', desc: 'Awaiting shipping pickup.', completed: false },
      { status: 'Delivered', date: '', desc: 'Awaiting shipping completion.', completed: false }
    ],
    invoiceUrl: '/invoices/invoice-98762.pdf'
  }
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: mockOrders,
  activeOrder: null,
  isLoading: false,

  createOrder: async (items, totals, address, paymentMethod) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const newOrder: Order = {
      id: 'ord_' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toISOString(),
      status: 'pending',
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      shippingAddress: address,
      paymentMethod,
      trackingTimeline: [
        { status: 'Order Placed', date: new Date().toLocaleString(), desc: 'Order has been placed on the blockchain network.', completed: true },
        { status: 'Processed', date: '', desc: 'Verification processing in background.', completed: false },
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
  },

  fetchOrders: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 600));
    set({ orders: get().orders, isLoading: false });
  },

  fetchOrderById: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    const order = get().orders.find((o) => o.id === id) || null;
    set({ activeOrder: order, isLoading: false });
    return order;
  },

  cancelOrder: async (id) => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const orderIndex = get().orders.findIndex((o) => o.id === id);
    if (orderIndex > -1) {
      const updatedOrders = [...get().orders];
      const order = updatedOrders[orderIndex];
      
      if (order.status === 'pending' || order.status === 'processing') {
        order.status = 'cancelled';
        order.trackingTimeline.push({
          status: 'Cancelled',
          date: new Date().toLocaleString(),
          desc: 'This order was cancelled by the user.',
          completed: true
        });
        set({ orders: updatedOrders, isLoading: false });
        return true;
      }
    }
    set({ isLoading: false });
    return false;
  }
}));
