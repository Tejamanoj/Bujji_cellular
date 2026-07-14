'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useUIStore } from '@/store/uiStore';
import { Order } from '@/types';
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Truck,
  XSquare,
  Clock,
  MapPin,
  CreditCard,
  Phone,
  Plus,
  Circle,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<Order['status'], { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',     icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: 'Processing', color: 'bg-primary-gold/10 text-light-gold border-primary-gold/20', icon: <Package className="w-3.5 h-3.5" /> },
  shipped:    { label: 'Shipped',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: <Truck className="w-3.5 h-3.5" /> },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  cancelled:  { label: 'Cancelled',  color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',    icon: <XSquare className="w-3.5 h-3.5" /> },
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { orders, updateOrderStatus } = useAdminStore();
  const { showToast } = useUIStore();

  const order = orders.find((o) => o.id === orderId);

  const [newStatus, setNewStatus] = useState<Order['status']>(order?.status ?? 'pending');
  const [updating, setUpdating] = useState(false);

  // New timeline step form
  const [stepStatus, setStepStatus] = useState('');
  const [stepDesc, setStepDesc] = useState('');

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-zinc-400 text-sm font-mono">Order <span className="text-light-gold">{orderId}</span> not found.</p>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-light-gold font-mono transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[order.status];

  const handleStatusUpdate = async () => {
    if (newStatus === order.status) return;
    setUpdating(true);
    const success = await updateOrderStatus(order.id, newStatus);
    setUpdating(false);
    if (success) {
      showToast(`Order status updated to ${newStatus}.`, 'success');
    } else {
      showToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-light-gold font-mono transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-sans tracking-tight text-white uppercase">
              Order Detail
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">
              Invoice ID:{' '}
              <span className="text-light-gold font-bold">{order.id}</span>
            </p>
          </div>

          {/* Current status badge */}
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-xs uppercase tracking-wider ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>
      </div>

      {/* ── Top strip: Update Status ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
        <div className="flex-1 space-y-1">
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Update Order Status</p>
          <p className="text-[10px] text-zinc-600 font-mono">Change the fulfilment stage for this order.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as Order['status'])}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-light-gold/50 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleStatusUpdate}
            disabled={updating || newStatus === order.status}
            className="px-5 py-2 bg-gradient-to-br from-accent-gold to-light-gold text-xs font-bold text-white rounded-xl hover:shadow-lg hover:shadow-accent-gold/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap"
          >
            {updating ? 'Saving...' : 'Apply'}
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Items + Timeline */}
        <div className="lg:col-span-2 space-y-6">

          {/* Ordered Items */}
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-900 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold">
                Ordered Hardware
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">{order.items.length} items</span>
            </div>
            <div className="divide-y divide-zinc-900">
              {order.items.map((item) => (
                <div key={item.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800/80 p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-zinc-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-zinc-100">{item.product.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-zinc-700"
                            style={{ backgroundColor: item.selectedColor }}
                          />
                          {item.selectedColor}
                        </span>
                        <span>•</span>
                        <span>{item.selectedStorage}</span>
                        <span>•</span>
                        <span>{item.product.brand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1 flex-shrink-0">
                    <p className="text-xs font-mono text-zinc-400">{item.quantity}×</p>
                    <p className="text-sm font-bold font-mono text-zinc-200">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-900">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold">
                Tracking Timeline
              </h3>
            </div>

            <div className="p-5 space-y-0">
              {order.trackingTimeline.length === 0 ? (
                <p className="text-xs text-zinc-600 font-mono py-4 text-center">No tracking events recorded yet.</p>
              ) : (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-zinc-800" />
                  <div className="space-y-0">
                    {order.trackingTimeline.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 pb-6 relative">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                          step.completed
                            ? 'border-light-gold bg-primary-gold/20'
                            : 'border-zinc-700 bg-zinc-900'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-3 h-3 text-light-gold" />
                          ) : (
                            <Circle className="w-3 h-3 text-zinc-600" />
                          )}
                        </div>
                        <div className="space-y-0.5 pt-0.5">
                          <p className={`text-xs font-bold ${step.completed ? 'text-zinc-200' : 'text-zinc-500'}`}>
                            {step.status}
                          </p>
                          <p className="text-[11px] text-zinc-500">{step.desc}</p>
                          <p className="text-[10px] text-zinc-600 font-mono">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary cards */}
        <div className="space-y-6">

          {/* Bill Calculation */}
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-900">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold">
                Bill Summary
              </h3>
            </div>
            <div className="p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="text-zinc-200">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>−₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-zinc-200">
                  {order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold text-base">
                <span className="text-zinc-200">Total</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-light-gold">
                  ₹{order.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-zinc-500" />
              Payment
            </h3>
            <p className="text-sm font-semibold text-zinc-200">{order.paymentMethod}</p>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
              Placed on {new Date(order.date).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* Shipping Address */}
          <div className="border border-zinc-900 bg-zinc-950/60 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500" />
              Ship To
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-bold text-zinc-100">{order.shippingAddress.name}</p>
              <p className="text-zinc-400 text-xs">{order.shippingAddress.street}</p>
              <p className="text-zinc-400 text-xs">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono pt-1">
              <Phone className="w-3.5 h-3.5 text-zinc-600" />
              {order.shippingAddress.phone}
            </div>
          </div>

          {/* Invoice link */}
          {order.invoiceUrl && (
            <a
              href={order.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-3 border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 rounded-xl text-xs font-mono font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              Download Invoice PDF ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
