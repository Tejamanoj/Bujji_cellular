'use client';

import React from 'react';
import { useAdminStore } from '@/store/adminStore';
import { MiniBarChart, MiniDonutChart } from '@/components/admin/MiniChart';
import { TrendingUp, ShoppingBag, DollarSign, Award, Users, BarChart3 } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { analytics, stats } = useAdminStore();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          Business Analytics
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Deep dive calculations, transaction values, category statistics and growth velocity metrics.
        </p>
      </div>

      {/* Analytics Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Average Order Value */}
        <div className="border border-zinc-800 bg-zinc-950/60 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Average Order Value</span>
          <h3 className="text-2xl font-bold text-zinc-100 font-mono">₹188.50</h3>
          <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.2% vs last month
          </p>
        </div>

        {/* Customer Conversion Rate */}
        <div className="border border-zinc-800 bg-zinc-950/60 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Conversion Rate</span>
          <h3 className="text-2xl font-bold text-zinc-100 font-mono">3.45%</h3>
          <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +1.1% vs last week
          </p>
        </div>

        {/* Customer Lifetime Value */}
        <div className="border border-zinc-800 bg-zinc-950/60 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">Customer LTV</span>
          <h3 className="text-2xl font-bold text-zinc-100 font-mono">₹1,240.00</h3>
          <p className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +8.3% vs last quarter
          </p>
        </div>
      </div>

      {/* Main charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase text-zinc-500 tracking-wider">
            <span>Daily Revenue Growth</span>
            <span className="text-light-gold">USD Velocity</span>
          </div>
          <MiniBarChart data={analytics.revenueHistory} height={230} />
        </div>

        {/* Donut chart */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase text-zinc-500 tracking-wider">
            <span>Category-wise sales distribution</span>
            <span className="text-light-gold">Percentage Shares</span>
          </div>
          <MiniDonutChart data={analytics.categorySales} />
        </div>
      </div>

      {/* Product Rankings and Monthly Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products Table */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-2">
            <Award className="w-4 h-4 text-light-gold" />
            Top Performing Artifacts
          </h3>

          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-900 bg-black/40 font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
                  <th className="px-5 py-3.5 font-semibold">Rank</th>
                  <th className="px-5 py-3.5 font-semibold">Product Name</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Units Sold</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-zinc-300">
                {analytics.topProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-zinc-900/10">
                    <td className="px-5 py-4 font-mono font-bold text-zinc-500">
                      #0{index + 1}
                    </td>
                    <td className="px-5 py-4 font-semibold text-zinc-200">
                      {product.name}
                    </td>
                    <td className="px-5 py-4 text-right font-mono text-zinc-400">
                      {product.sales}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-light-gold">
                      ₹{product.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Growth Trends */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold font-mono tracking-wider uppercase text-zinc-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-light-gold" />
            Growth Curve
          </h3>

          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 space-y-4">
            <div className="space-y-3.5">
              {analytics.customerGrowth.map((growth, idx) => {
                const prev = idx > 0 ? analytics.customerGrowth[idx - 1].count : growth.count;
                const change = growth.count - prev;
                return (
                  <div key={growth.month} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 font-semibold">{growth.month}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-200 font-bold">{growth.count} users</span>
                      {change > 0 && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                          +{change}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
