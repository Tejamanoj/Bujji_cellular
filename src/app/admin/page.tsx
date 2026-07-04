'use client';

import React from 'react';
import { useAdminStore } from '@/store/adminStore';
import { StatsCard } from '@/components/admin/StatsCard';
import { MiniBarChart, MiniDonutChart } from '@/components/admin/MiniChart';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Wrench,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { stats, orders, products, analytics, updateOrderStatus } = useAdminStore();

  // Get last 5 orders
  const recentOrders = orders.slice(0, 5);

  // Get low stock items (< 10 items)
  const lowStockItems = products.filter((p) => p.stock < 10);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'pending':
        return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-sans tracking-tight text-white uppercase flex items-center gap-2">
            Control Panel <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-primary-gold/10 border border-primary-gold/20 text-primary-gold uppercase tracking-widest">Overview</span>
          </h1>
          <p className="text-xs text-zinc-550 mt-1 font-mono uppercase tracking-wide">
            Real-time shop statistics and system status updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/3 border border-white/6 text-xs font-mono text-zinc-350 rounded-xl hover:bg-white/6 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Sync
          </button>
          
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-amber-400 to-yellow-500 text-xs font-bold text-black rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 text-black" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          label="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
          icon={DollarSign}
          trend={stats.revenueChange}
        />
        <StatsCard
          label="Sales Volume"
          value={`${stats.totalOrders.toLocaleString()} orders`}
          icon={ShoppingBag}
          trend={stats.ordersChange}
        />
        <StatsCard
          label="Customers"
          value={`${stats.totalCustomers.toLocaleString()} accounts`}
          icon={Users}
          trend={stats.customersChange}
        />
        <StatsCard
          label="Active Repairs"
          value={`${stats.activeRepairs} tickets`}
          icon={Wrench}
          trend={stats.repairsChange}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-450">
              Revenue Velocity
            </h3>
            <span className="text-[10px] text-zinc-550 font-mono tracking-wider">
              LAST 7 DAYS
            </span>
          </div>
          <div className="ultra-glass rounded-2xl border border-white/5 p-5">
            <MiniBarChart data={analytics.revenueHistory} />
          </div>
        </div>

        {/* Categories Breakdown */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-450">
              Category Shares
            </h3>
            <span className="text-[10px] text-zinc-550 font-mono tracking-wider">
              ALL TIME VOLUME
            </span>
          </div>
          <div className="ultra-glass rounded-2xl border border-white/5 p-5">
            <MiniDonutChart data={analytics.categorySales} />
          </div>
        </div>
      </div>

      {/* Recent Activity & Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders table */}
        <div className="lg:col-span-2 space-y-3 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-450">
              Recent Transactions
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary-gold hover:underline font-semibold flex items-center gap-1 group"
            >
              All Orders
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="border border-white/5 bg-white/2 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
                  <th className="px-5 py-3.5 font-semibold">ID</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-zinc-400">
                      {order.id}
                    </td>
                    <td className="px-5 py-4 font-mono text-zinc-500">
                      {new Date(order.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-5 py-4 font-medium text-zinc-200">
                      {order.shippingAddress.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase tracking-wide ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-zinc-200">
                      ₹{order.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-450">
              System Warnings
            </h3>
            <span className="text-[10px] text-zinc-550 font-mono tracking-wider">
              {lowStockItems.length} ISSUES
            </span>
          </div>

          <div className="border border-white/5 bg-white/2 rounded-2xl p-5 space-y-4">
            {lowStockItems.length === 0 ? (
              <div className="flex items-center gap-3 text-emerald-400/90 py-4 font-mono text-xs">
                <TrendingUp className="w-5 h-5 flex-shrink-0" />
                All stock levels are within normal bounds.
              </div>
            ) : (
              <div className="space-y-3.5">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 p-3.5 bg-white/2 border border-white/5 rounded-xl hover:border-primary-gold/20 transition-colors"
                  >
                    <div className="flex items-start gap-3 text-left">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-zinc-200 line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono text-zinc-550">
                          ID: {item.id} • Brand: {item.brand}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                          item.stock === 0
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.stock === 0 ? 'SOLD OUT' : `${item.stock} LEFT`}
                      </span>
                      <Link
                        href={`/admin/products`}
                        className="text-[9px] font-mono uppercase text-primary-gold hover:underline font-bold"
                      >
                        Restock
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
