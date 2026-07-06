import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { DashboardStats, AnalyticsData } from '@/types';

// ─── Analytics ───────────────────────────────────────────────────────────────

/** Fetch dashboard stats aggregated from Firestore */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const [ordersSnap, customersSnap, repairsSnap] = await Promise.all([
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'customers')),
      getDocs(query(collection(db, 'repair_requests'))),
    ]);

    const orders = ordersSnap.docs.map((d) => d.data());
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = customersSnap.size;

    const activeStatuses = ['submitted', 'received', 'inspecting', 'repairing'];
    const activeRepairs = repairsSnap.docs.filter((d) =>
      activeStatuses.includes(d.data().status)
    ).length;

    return {
      totalRevenue,
      revenueChange: 0,
      totalOrders,
      ordersChange: 0,
      totalCustomers,
      customersChange: 0,
      activeRepairs,
      repairsChange: 0,
    };
  } catch (e: any) {
    console.error('❌ fetchDashboardStats:', e.message);
    return {
      totalRevenue: 0, revenueChange: 0,
      totalOrders: 0, ordersChange: 0,
      totalCustomers: 0, customersChange: 0,
      activeRepairs: 0, repairsChange: 0,
    };
  }
}

/** Fetch chart data for admin analytics */
export async function fetchAnalyticsData(): Promise<AnalyticsData> {
  try {
    const [ordersSnap, productsSnap] = await Promise.all([
      getDocs(query(collection(db, 'orders'), orderBy('date', 'asc'))),
      getDocs(collection(db, 'products')),
    ]);

    // Revenue history by date (last 7 unique dates)
    const dateMap: Record<string, number> = {};
    ordersSnap.docs.forEach((d) => {
      const date = (d.data().date ?? '').split('T')[0];
      if (date) dateMap[date] = (dateMap[date] ?? 0) + (d.data().total ?? 0);
    });
    const revenueHistory = Object.entries(dateMap)
      .slice(-7)
      .map(([date, amount]) => ({ date, amount }));

    // Category breakdown
    const catMap: Record<string, number> = {};
    productsSnap.docs.forEach((d) => {
      const cat = d.data().category ?? 'other';
      catMap[cat] = (catMap[cat] ?? 0) + 1;
    });
    const categorySales = Object.entries(catMap).map(([category, value]) => ({
      category,
      value,
    }));

    return { revenueHistory, categorySales, topProducts: [], customerGrowth: [] };
  } catch (e: any) {
    console.error('❌ fetchAnalyticsData:', e.message);
    return { revenueHistory: [], categorySales: [], topProducts: [], customerGrowth: [] };
  }
}
