'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Eye, Calendar, DollarSign, Archive } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, fetchOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColors = {
    pending: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-400',
    processing: 'border-blue-500/20 bg-blue-950/20 text-blue-400',
    shipped: 'border-purple-500/20 bg-purple-950/20 text-purple-400',
    delivered: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400',
    cancelled: 'border-red-500/20 bg-red-950/20 text-red-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Transaction Ledger</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Your Orders</h1>
        <p className="text-sm text-zinc-500 mt-2">Audit and track all transaction deliveries and physical assets.</p>
      </div>

      {orders.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center ultra-glass border border-white/5 rounded-2xl">
          <Archive size={36} className="text-zinc-700 animate-pulse" />
          <p className="text-xs text-zinc-500">No transactions recorded inside your corporate ledger.</p>
          <button onClick={() => router.push('/products')} className="btn-gold px-7 py-3 text-xs font-bold uppercase tracking-wider">
            Shop Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => router.push(`/orders/${order.id}`)}
              className="ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 transition-all duration-300"
            >
              {/* Order summary info */}
              <div className="flex flex-col sm:flex-row sm:space-x-8 text-left space-y-2 sm:space-y-0">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Order ID</span>
                  <p className="text-xs font-mono font-bold text-white uppercase mt-0.5">{order.id}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center space-x-1">
                    <Calendar size={10} />
                    <span>Timestamp</span>
                  </span>
                  <p className="text-xs text-zinc-300 font-semibold mt-0.5">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold flex items-center space-x-1">
                    <DollarSign size={10} />
                    <span>Total Cost</span>
                  </span>
                  <p className="text-xs text-primary-gold font-bold mt-0.5">₹{order.total.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Items count</span>
                  <p className="text-xs text-zinc-300 mt-0.5">{order.items.reduce((a, c) => a + c.quantity, 0)} units</p>
                </div>
              </div>

              {/* Status and button */}
              <div className="flex items-center space-x-4 justify-between md:justify-end">
                <span className={`px-2.5 py-1 rounded border text-[10px] uppercase font-bold tracking-wider font-mono ${statusColors[order.status]}`}>
                  {order.status}
                </span>
                
                <button className="btn-outline inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider">
                  <Eye size={11} />
                  Inspect Audit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
