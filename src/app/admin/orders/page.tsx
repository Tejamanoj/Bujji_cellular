'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Order } from '@/types';
import { Eye, ChevronRight, ChevronDown, CheckCircle, Package, Truck, XSquare, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter orders by status if selected
  const filteredOrders = orders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const getStatusBadge = (status: Order['status']) => {
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

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'processing':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'cancelled':
        return <XSquare className="w-4 h-4 text-rose-400" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const columns: Column<Order>[] = [
    {
      header: 'Order ID',
      accessor: (order) => (
        <button
          onClick={() => toggleExpandOrder(order.id)}
          className="font-mono font-bold text-zinc-300 hover:text-amber-400 flex items-center gap-1.5 transition-colors text-left"
        >
          {expandedOrderId === order.id ? (
            <ChevronDown className="w-4 h-4 text-amber-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )}
          {order.id}
        </button>
      ),
      sortKey: 'id',
    },
    {
      header: 'Date',
      accessor: (order) => (
        <span className="font-mono text-zinc-500">
          {new Date(order.date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
      sortKey: 'date',
    },
    {
      header: 'Recipient',
      accessor: (order) => (
        <span className="font-semibold text-zinc-200">{order.shippingAddress.name}</span>
      ),
    },
    {
      header: 'Total Value',
      accessor: (order) => <span className="font-mono font-bold text-zinc-200">?{order.total}</span>,
      sortKey: 'total',
    },
    {
      header: 'Status',
      accessor: (order) => (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[9px] uppercase tracking-wide ${getStatusBadge(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{order.status}</span>
          </span>
        </div>
      ),
      sortKey: 'status',
    },
    {
      header: 'Update Status',
      accessor: (order) => (
        <select
          value={order.status}
          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      header: 'Actions',
      accessor: (order) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleExpandOrder(order.id)}
            className="p-2 rounded-xl bg-white/3 hover:bg-white/6 text-zinc-400 hover:text-zinc-200 border border-white/6 transition-colors"
            title="Quick Expand"
          >
            {expandedOrderId === order.id ? (
              <ChevronDown className="w-4 h-4 text-amber-400" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <Link
            href={`/admin/orders/${order.id}`}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-colors"
            title="Full Order Detail"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      ),
    },
  ];

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const statusFilterComponent = (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-400/50 cursor-pointer"
    >
      {statuses.map((s) => (
        <option key={s} value={s} className="bg-zinc-950 font-sans">
          {s.toUpperCase()}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          Order Dispatcher
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Monitor order queueing, processing queues, courier status and invoices.
        </p>
      </div>

      {/* Main Table */}
      <div className="space-y-6">
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchKey="id"
          searchPlaceholder="Search order ID..."
          filterComponent={statusFilterComponent}
          rowKey={(o) => o.id}
          initialSort={{ key: 'date', direction: 'desc' }}
          pageSize={10}
        />

        {/* Selected Order Detail Panel */}
        {expandedOrderId && (
          (() => {
            const order = orders.find((o) => o.id === expandedOrderId);
            if (!order) return null;

            return (
              <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-6 animate-fade-in">
                <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Selected Record Detail</span>
                    <h3 className="text-base font-bold text-zinc-200 font-mono">Invoice Summary: {order.id}</h3>
                  </div>
                  <div className="text-right space-y-1 text-xs">
                    <p className="text-zinc-400">Payment: <span className="font-semibold text-zinc-200">{order.paymentMethod}</span></p>
                    <p className="text-zinc-400">Recipient Phone: <span className="font-semibold text-zinc-200 font-mono">{order.shippingAddress.phone}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Items List */}
                  <div className="md:col-span-2 space-y-3">
                    <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Ordered Hardware</h4>
                    <div className="border border-zinc-900 rounded-xl divide-y divide-zinc-900">
                      {order.items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800/80 p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-md" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-zinc-200 line-clamp-1">{item.product.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-zinc-800" style={{ backgroundColor: item.selectedColor }} /> {item.selectedColor}</span>
                                <span>â€¢</span>
                                <span>{item.selectedStorage}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-mono text-xs text-zinc-400">
                            <span>{item.quantity}x</span>
                            <span className="font-semibold text-zinc-200 ml-2">?{item.product.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address & Calculation details */}
                  <div className="space-y-5">
                    {/* Shipping Address */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Shipment Destination</h4>
                      <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs space-y-1 text-zinc-300">
                        <p className="font-bold text-zinc-100">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider">Bill Calculation</h4>
                      <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs space-y-2 text-zinc-400 font-mono">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="text-zinc-200">?{order.subtotal}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Discount:</span>
                            <span>-${order.discount}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span className="text-zinc-200">?{order.shipping}</span>
                        </div>
                        <div className="border-t border-zinc-800/80 pt-2 flex justify-between text-zinc-100 font-bold">
                          <span>Total:</span>
                          <span className="text-amber-400">?{order.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
