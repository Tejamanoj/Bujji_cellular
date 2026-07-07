import { create } from 'zustand';
import { Product, Order, CustomerInfo, RepairRequest, DashboardStats, AnalyticsData } from '@/types';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/backend/firebase';
import { fetchDashboardStats, fetchAnalyticsData } from '@/backend/analytics';
import { createProduct, updateProduct as dbUpdateProduct, deleteProduct as dbDeleteProduct, bulkDeleteProducts as dbBulkDeleteProducts } from '@/backend/products';
import { updateOrderStatus as dbUpdateOrderStatus } from '@/backend/orders';
import { updateCustomerStatus as dbUpdateCustomerStatus } from '@/backend/customers';
import { updateRepairStatus as dbUpdateRepairStatus, addRepairMessage as dbAddRepairMessage } from '@/backend/repairs';

interface AdminState {
  stats: DashboardStats;
  products: Product[];
  orders: Order[];
  customers: CustomerInfo[];
  repairs: RepairRequest[];
  analytics: AnalyticsData;
  isLoading: boolean;
  
  // Actions
  syncData: () => () => void; // returns unsubscribe function
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviews' | 'qa'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  bulkDeleteProducts: (ids: string[]) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<boolean>;
  updateCustomerStatus: (customerId: string, status: 'active' | 'banned') => Promise<boolean>;
  updateRepairStatus: (repairId: string, status: RepairRequest['status'], cost?: number) => Promise<boolean>;
  addRepairMessage: (repairId: string, text: string) => Promise<boolean>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stats: {
    totalRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalCustomers: 0,
    customersChange: 0,
    activeRepairs: 0,
    repairsChange: 0,
  },
  products: [],
  orders: [],
  customers: [],
  repairs: [],
  analytics: {
    revenueHistory: [],
    categorySales: [],
    topProducts: [],
    customerGrowth: [],
  },
  isLoading: false,

  syncData: () => {
    set({ isLoading: true });
    
    // Subscribe to products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsList: Product[] = snapshot.docs.map((docSnap) => {
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
      set({ products: productsList });
    });

    // Subscribe to orders
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('date', 'desc')), (snapshot) => {
      const ordersList: Order[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date,
          status: data.status,
          items: data.items ?? [],
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
      set({ orders: ordersList });
    });

    // Subscribe to customers
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const customersList: CustomerInfo[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          email: data.email,
          phone: data.phone ?? '',
          profileImage: data.profileImage || '/images/avatar-placeholder.svg',
          loyaltyPoints: data.loyaltyPoints ?? 0,
          status: data.status ?? 'active',
          ordersCount: data.ordersCount ?? 0,
          totalSpent: data.totalSpent ?? 0,
          joinDate: data.joinDate ?? new Date().toISOString(),
          repairRequestsCount: data.repairRequestsCount ?? 0,
        };
      });
      set({ customers: customersList });
    });

    // Subscribe to repairs
    const unsubRepairs = onSnapshot(collection(db, 'repair_requests'), (snapshot) => {
      const repairsList: RepairRequest[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          deviceName: data.deviceName,
          issueDesc: data.issueDesc,
          imageUrls: data.imageUrls ?? [],
          pickupAddress: data.pickupAddress,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          status: data.status ?? 'submitted',
          cost: data.cost ?? 0,
          messages: data.messages ?? [],
        };
      });
      set({ repairs: repairsList });
    });

    // Load async dashboard statistics and charts
    const loadStats = async () => {
      const statsObj = await fetchDashboardStats();
      const analyticsObj = await fetchAnalyticsData();
      set({ stats: statsObj, analytics: analyticsObj, isLoading: false });
    };
    loadStats();

    // Return combined unsubscribe
    return () => {
      unsubProducts();
      unsubOrders();
      unsubCustomers();
      unsubRepairs();
    };
  },

  addProduct: async (product) => {
    const res = await createProduct(product);
    return res.success;
  },

  updateProduct: async (product) => {
    const res = await dbUpdateProduct(product);
    return res.success;
  },

  deleteProduct: async (id) => {
    const res = await dbDeleteProduct(id);
    return res.success;
  },

  bulkDeleteProducts: async (ids) => {
    const res = await dbBulkDeleteProducts(ids);
    return res.success;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await dbUpdateOrderStatus(orderId, status);
    return res.success;
  },

  updateCustomerStatus: async (customerId, status) => {
    const res = await dbUpdateCustomerStatus(customerId, status);
    return res.success;
  },

  updateRepairStatus: async (repairId, status, cost) => {
    const res = await dbUpdateRepairStatus(repairId, status, cost);
    return res.success;
  },

  addRepairMessage: async (repairId, text) => {
    const res = await dbAddRepairMessage(repairId, text, 'admin');
    return res.success;
  },
}));
