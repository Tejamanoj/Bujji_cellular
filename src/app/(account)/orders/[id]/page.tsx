'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useOrderStore } from '@/store/orderStore';
import { Timeline } from '@/components/common/Timeline';
import { ArrowLeft, ShieldCheck, Box, CreditCard, MapPin, Calendar, FileText } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { orders } = useOrderStore();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <FileText size={24} />
        </div>
        <h2 className="text-xl font-bold uppercase tracking-wide text-white">Audit File Missing</h2>
        <p className="text-xs text-zinc-550">We couldn't locate this transaction inside your corporate ledger.</p>
        <button onClick={() => router.push('/orders')} className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
          Return to Ledger
        </button>
      </div>
    );
  }

  // Map order status to timeline steps
  const steps = [
    { title: 'Transaction Confirmed', completed: true, description: 'Escrow contract initialized on-chain.' },
    { title: 'Asset Allocated', completed: ['processing', 'shipped', 'delivered'].includes(order.status), description: 'Hardware items matched and serialized.' },
    { title: 'Courier Dispatched', completed: ['shipped', 'delivered'].includes(order.status), description: 'Premium air shipping tracking active.' },
    { title: 'Delivery Completed', completed: order.status === 'delivered', description: 'Asset signed and safely received.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      {/* Navigation Back */}
      <button
        onClick={() => router.push('/orders')}
        className="flex items-center space-x-1.5 text-xs text-zinc-550 hover:text-primary-gold mb-6 uppercase tracking-wider font-semibold transition-colors"
      >
        <ArrowLeft size={12} />
        <span>Back to Ledger</span>
      </button>

      {/* Header */}
      <div className="border-b border-white/5 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] text-primary-gold uppercase tracking-[0.25em] font-bold">Transaction Record</span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight mt-1">
            Order: <span className="font-mono text-zinc-400">{order.id}</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2 flex items-center gap-1.5">
            <Calendar size={13} />
            Registered: <span className="font-bold text-zinc-300">{new Date(order.date).toLocaleDateString()}</span>
          </p>
        </div>

        <div className="text-left md:text-right bg-white/2 border border-white/5 p-4 rounded-xl">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Total Cost</span>
          <p className="text-2xl font-black text-primary-gold mt-1">₹{order.total.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Shipment Status Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Box size={14} className="text-primary-gold" />
              <span>Asset Progress</span>
            </h3>
            <Timeline steps={steps} />
          </div>

          {/* Escrow Details */}
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <CreditCard size={14} className="text-primary-gold" />
              <span>Payment Details</span>
            </h3>
            <div className="space-y-3 text-xs text-zinc-400">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Security Cleared Via</span>
                <span className="text-zinc-200 font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="border-t border-white/5 pt-3">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Escrow Clearance Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck size={13} />
                  Safe Clearance Approved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ordered Items List & Destination Address */}
        <div className="lg:col-span-2 space-y-6">
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Allocated Assets</h3>
            
            <div className="divide-y divide-white/5">
              {order.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-zinc-900 border border-white/8 p-0.5 overflow-hidden flex items-center justify-center shrink-0">
                    {item.product.images?.[0] ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <Box className="w-5 h-5 text-zinc-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <span className="text-[9px] text-primary-gold uppercase font-mono tracking-widest block">{item.product.brand}</span>
                    <h4 className="font-display font-bold text-xs text-zinc-200 truncate mt-0.5">{item.product.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 font-mono uppercase">
                      Finish: <span className="text-zinc-300 font-bold">{item.selectedColor}</span> • Memory: <span className="text-zinc-300 font-bold">{item.selectedStorage}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-white">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">QTY: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery destination */}
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin size={14} className="text-primary-gold" />
              <span>Destination Coordinates</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400 text-left">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Recipient Identity</span>
                <p className="text-zinc-200 font-bold mt-0.5">{order.shippingAddress.name}</p>
                <p className="text-zinc-500 mt-0.5">{order.shippingAddress.phone}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Street Delivery Coordinates</span>
                <p className="text-zinc-200 mt-0.5">{order.shippingAddress.street}</p>
                <p className="text-zinc-400">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
