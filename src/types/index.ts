export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface QA {
  id: string;
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  rating: number;
  images: string[];
  category: string;
  brand: string;
  colors: string[];
  storage: string[];
  specs: { [key: string]: string };
  reviews: Review[];
  qa: QA[];
  stock: number;
  featured?: boolean;
  flashSale?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  loyaltyPoints: number;
}

export interface CartItem {
  id: string; // combination of productId_color_storage
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedStorage: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface Card {
  id: string;
  holderName: string;
  cardNumber: string;
  expiry: string;
  cardType: 'visa' | 'mastercard' | 'amex';
}

export interface TrackingStep {
  status: string;
  date: string;
  desc: string;
  completed: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: string;
  trackingTimeline: TrackingStep[];
  invoiceUrl?: string;
}

export interface RepairMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: string;
}

export interface RepairRequest {
  id: string;
  deviceName: string;
  issueDesc: string;
  imageUrls: string[];
  pickupAddress: Address;
  preferredDate: string;
  preferredTime: string;
  status: 'submitted' | 'received' | 'inspecting' | 'repairing' | 'completed';
  messages: RepairMessage[];
  cost?: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  avatarUrl?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number; // percentage change
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  activeRepairs: number;
  repairsChange: number;
}

export interface CustomerInfo extends User {
  status: 'active' | 'banned';
  ordersCount: number;
  totalSpent: number;
  joinDate: string;
  repairRequestsCount: number;
}

export interface AnalyticsData {
  revenueHistory: { date: string; amount: number }[];
  categorySales: { category: string; value: number }[];
  topProducts: { id: string; name: string; sales: number; revenue: number }[];
  customerGrowth: { month: string; count: number }[];
}

