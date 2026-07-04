import { create } from 'zustand';
import { Product, Order, CustomerInfo, RepairRequest, DashboardStats, AnalyticsData } from '@/types';

interface AdminState {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
  customers: CustomerInfo[];
  repairs: RepairRequest[];
  analytics: AnalyticsData;
  
  // Actions
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'qa'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateCustomerStatus: (customerId: string, status: 'active' | 'banned') => void;
  updateRepairStatus: (repairId: string, status: RepairRequest['status'], cost?: number) => void;
  addRepairMessage: (repairId: string, text: string) => void;
}

// Initial Mock Products
const mockAdminProducts: Product[] = [
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
    reviews: [],
    qa: [],
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
    ],
    category: 'audio',
    brand: 'Bujji',
    colors: ['#D4AF37', '#111111'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 45,
    featured: true,
  },
  {
    id: 'prod_3',
    name: 'Nothing Phone (3) Dark Cyber',
    price: 899,
    description: 'Premium smartphone with a unique translucent backing, programmable LED glyph interface, and eco-friendly recycled gold internal contacts.',
    rating: 4.6,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'smartphones',
    brand: 'Nothing',
    colors: ['#111111', '#FFFFFF'],
    storage: ['128GB', '256GB'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 5,
    featured: false,
  },
  {
    id: 'prod_4',
    name: 'Bujji Chrono Gold Smartwatch',
    price: 449,
    originalPrice: 499,
    description: 'Handcrafted luxury smartwatch with real gold bezels, high-precision vitals tracking, and offline holographic map features.',
    rating: 4.7,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'wearables',
    brand: 'Bujji',
    colors: ['#D4AF37', '#0A0A0A'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 22,
    featured: true,
  },
  {
    id: 'prod_5',
    name: 'Glacier MagSafe Gold Case',
    price: 79,
    description: 'Ultra-thin, drop-tested bumper protective case featuring solid brass buttons and premium gold glitter infused backing.',
    rating: 4.5,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    ],
    category: 'accessories',
    brand: 'Bujji',
    colors: ['#D4AF37', '#000000'],
    storage: ['Standard'],
    specs: {},
    reviews: [],
    qa: [],
    stock: 0, // Out of stock to test alerts
    featured: false,
  }
];

// Initial Mock Orders
const mockAdminOrders: Order[] = [
  {
    id: 'ord_98721',
    date: '2026-06-25T10:30:00Z',
    status: 'delivered',
    items: [
      {
        id: 'prod_2_#D4AF37_Standard',
        product: mockAdminProducts[1],
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
    paymentMethod: 'Credit Card',
    trackingTimeline: []
  },
  {
    id: 'ord_98722',
    date: '2026-06-26T08:15:00Z',
    status: 'processing',
    items: [
      {
        id: 'prod_1_#D4AF37_512GB',
        product: mockAdminProducts[0],
        quantity: 1,
        selectedColor: '#D4AF37',
        selectedStorage: '512GB'
      },
      {
        id: 'prod_4_#D4AF37_Standard',
        product: mockAdminProducts[3],
        quantity: 1,
        selectedColor: '#D4AF37',
        selectedStorage: 'Standard'
      }
    ],
    subtotal: 1748,
    discount: 100,
    shipping: 15,
    total: 1663,
    shippingAddress: {
      id: 'addr_2',
      name: 'John Doe',
      street: '456 Silvercrest Lane',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      phone: '+1 555-0155',
      isDefault: false
    },
    paymentMethod: 'PayPal',
    trackingTimeline: []
  },
  {
    id: 'ord_98723',
    date: '2026-06-26T14:45:00Z',
    status: 'pending',
    items: [
      {
        id: 'prod_3_#111111_256GB',
        product: mockAdminProducts[2],
        quantity: 2,
        selectedColor: '#111111',
        selectedStorage: '256GB'
      }
    ],
    subtotal: 1798,
    discount: 0,
    shipping: 15,
    total: 1813,
    shippingAddress: {
      id: 'addr_3',
      name: 'Sarah Connor',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      phone: '+1 555-0842',
      isDefault: false
    },
    paymentMethod: 'Apple Pay',
    trackingTimeline: []
  }
];

// Initial Mock Customers
const mockAdminCustomers: CustomerInfo[] = [
  {
    id: 'cust_1',
    name: 'Teja M',
    email: 'teja@bujjicellulars.com',
    loyaltyPoints: 1250,
    status: 'active',
    ordersCount: 8,
    totalSpent: 4250,
    joinDate: '2025-11-12',
    repairRequestsCount: 1,
    profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_2',
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    loyaltyPoints: 340,
    status: 'active',
    ordersCount: 2,
    totalSpent: 1663,
    joinDate: '2026-02-18',
    repairRequestsCount: 0,
    profileImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_3',
    name: 'Sarah Connor',
    email: 'sconnor@cyberdyne.com',
    loyaltyPoints: 180,
    status: 'active',
    ordersCount: 1,
    totalSpent: 1813,
    joinDate: '2026-05-01',
    repairRequestsCount: 2,
    profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_4',
    name: 'Bruce Wayne',
    email: 'bruce@waynecorp.com',
    loyaltyPoints: 9999,
    status: 'active',
    ordersCount: 15,
    totalSpent: 48900,
    joinDate: '2025-01-01',
    repairRequestsCount: 5,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'cust_5',
    name: 'Lois Lane',
    email: 'llane@dailyplanet.com',
    loyaltyPoints: 50,
    status: 'banned',
    ordersCount: 0,
    totalSpent: 0,
    joinDate: '2026-06-10',
    repairRequestsCount: 0
  }
];

// Initial Mock Repairs
const mockAdminRepairs: RepairRequest[] = [
  {
    id: 'rep_101',
    deviceName: 'iPhone 15 Pro Max',
    issueDesc: 'Cracked back glass plate and loose charging port. Needs gold custom backing if possible.',
    imageUrls: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80'],
    pickupAddress: {
      id: 'addr_1',
      name: 'Teja M',
      street: '100 Golden Boulevard, Suite 500',
      city: 'Metropolis',
      state: 'NY',
      zip: '10001',
      phone: '+1 555-0199',
      isDefault: true
    },
    preferredDate: '2026-06-28',
    preferredTime: '14:00 - 16:00',
    status: 'received',
    messages: [
      { id: 'm1', sender: 'user', text: 'Please handle with care, the display is still working.', timestamp: '2026-06-25T11:00:00Z' }
    ],
    cost: 150
  },
  {
    id: 'rep_102',
    deviceName: 'Bujji Gold-Phantom Smartphone',
    issueDesc: 'Accidental drop, screen is showing green lines. Holographic lens seems out of alignment.',
    imageUrls: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80'],
    pickupAddress: {
      id: 'addr_3',
      name: 'Sarah Connor',
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'IL',
      zip: '62704',
      phone: '+1 555-0842',
      isDefault: false
    },
    preferredDate: '2026-06-29',
    preferredTime: '10:00 - 12:00',
    status: 'submitted',
    messages: [],
  }
];

// Initial Stats
const initialStats: DashboardStats = {
  totalRevenue: 124500,
  revenueChange: 14.2,
  totalOrders: 1248,
  ordersChange: 8.5,
  totalCustomers: 843,
  customersChange: 12.3,
  activeRepairs: 14,
  repairsChange: -5.4
};

// Initial Analytics Data
const initialAnalytics: AnalyticsData = {
  revenueHistory: [
    { date: 'Jun 20', amount: 12500 },
    { date: 'Jun 21', amount: 15200 },
    { date: 'Jun 22', amount: 14800 },
    { date: 'Jun 23', amount: 19100 },
    { date: 'Jun 24', amount: 16400 },
    { date: 'Jun 25', amount: 22100 },
    { date: 'Jun 26', amount: 24400 }
  ],
  categorySales: [
    { category: 'Smartphones', value: 58 },
    { category: 'Audio', value: 18 },
    { category: 'Wearables', value: 14 },
    { category: 'Accessories', value: 10 }
  ],
  topProducts: [
    { id: 'prod_1', name: 'Bujji Gold-Phantom Smartphone', sales: 48, revenue: 62352 },
    { id: 'prod_2', name: 'AeroBuds Gold Premium Edition', sales: 124, revenue: 30876 },
    { id: 'prod_4', name: 'Bujji Chrono Gold Smartwatch', sales: 62, revenue: 27838 },
    { id: 'prod_5', name: 'Glacier MagSafe Gold Case', sales: 42, revenue: 3318 }
  ],
  customerGrowth: [
    { month: 'Jan', count: 420 },
    { month: 'Feb', count: 490 },
    { month: 'Mar', count: 580 },
    { month: 'Apr', count: 670 },
    { month: 'May', count: 760 },
    { month: 'Jun', count: 843 }
  ]
};

export const useAdminStore = create<AdminState>((set) => ({
  stats: initialStats,
  products: mockAdminProducts,
  orders: mockAdminOrders,
  customers: mockAdminCustomers,
  repairs: mockAdminRepairs,
  analytics: initialAnalytics,

  addProduct: (product) => set((state) => {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      rating: 5.0,
      reviews: [],
      qa: []
    };
    return {
      products: [newProduct, ...state.products]
    };
  }),

  updateProduct: (updatedProduct) => set((state) => ({
    products: state.products.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter((p) => p.id !== id)
  })),

  bulkDeleteProducts: (ids) => set((state) => ({
    products: state.products.filter((p) => !ids.includes(p.id))
  })),

  updateOrderStatus: (orderId, status) => set((state) => {
    const updatedOrders = state.orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          trackingTimeline: [
            {
              status: status.toUpperCase(),
              date: new Date().toISOString(),
              desc: `Order marked as ${status} by Administrator.`,
              completed: true
            },
            ...o.trackingTimeline
          ]
        };
      }
      return o;
    });

    let revenueDelta = 0;
    if (status === 'delivered') {
      const order = state.orders.find((o) => o.id === orderId);
      if (order && order.status !== 'delivered') {
        revenueDelta = order.total;
      }
    }

    return {
      orders: updatedOrders,
      stats: {
        ...state.stats,
        totalRevenue: state.stats.totalRevenue + revenueDelta
      }
    };
  }),

  updateCustomerStatus: (customerId, status) => set((state) => ({
    customers: state.customers.map((c) => c.id === customerId ? { ...c, status } : c)
  })),

  updateRepairStatus: (repairId, status, cost) => set((state) => {
    const updatedRepairs = state.repairs.map((r) => {
      if (r.id === repairId) {
        const update: Partial<RepairRequest> = { status };
        if (cost !== undefined) update.cost = cost;
        return { ...r, ...update };
      }
      return r;
    });
    
    const activeCount = updatedRepairs.filter((r) => r.status !== 'completed').length;

    return {
      repairs: updatedRepairs,
      stats: {
        ...state.stats,
        activeRepairs: activeCount
      }
    };
  }),

  addRepairMessage: (repairId, text) => set((state) => ({
    repairs: state.repairs.map((r) => {
      if (r.id === repairId) {
        return {
          ...r,
          messages: [
            ...r.messages,
            {
              id: `msg_${Date.now()}`,
              sender: 'admin',
              text,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return r;
    })
  }))
}));
