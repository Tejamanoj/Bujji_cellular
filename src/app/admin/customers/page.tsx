'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { CustomerInfo } from '@/types';
import { User, Eye, Ban, ShieldCheck, Mail, Calendar, Sparkles } from 'lucide-react';

export default function AdminCustomersPage() {
  const { customers, updateCustomerStatus } = useAdminStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const toggleCustomerBan = (customerId: string, currentStatus: 'active' | 'banned') => {
    const nextStatus = currentStatus === 'active' ? 'banned' : 'active';
    const actionText = nextStatus === 'banned' ? 'BAN' : 'ACTIVATE';
    if (confirm(`Are you sure you want to ${actionText} this customer account?`)) {
      updateCustomerStatus(customerId, nextStatus);
    }
  };

  const columns: Column<CustomerInfo>[] = [
    {
      header: 'Customer Details',
      accessor: (customer) => (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-900 overflow-hidden flex-shrink-0 flex items-center justify-center p-0.5">
            {customer.profileImage ? (
              <img
                src={customer.profileImage}
                alt={customer.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User className="w-5 h-5 text-zinc-600" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-100">{customer.name}</span>
            <span className="text-xs text-zinc-500 font-mono block leading-none">{customer.email}</span>
          </div>
        </div>
      ),
      sortKey: 'name',
    },
    {
      header: 'Join Date',
      accessor: (customer) => <span className="font-mono text-zinc-500">{customer.joinDate}</span>,
      sortKey: 'joinDate',
    },
    {
      header: 'Orders',
      accessor: (customer) => <span className="font-mono font-bold text-zinc-300">{customer.ordersCount}</span>,
      sortKey: 'ordersCount',
    },
    {
      header: 'Total Spent',
      accessor: (customer) => <span className="font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-light-gold">₹{customer.totalSpent.toLocaleString()}</span>,
      sortKey: 'totalSpent',
    },
    {
      header: 'Loyalty Points',
      accessor: (customer) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-primary-gold/10 text-light-gold border border-primary-gold/20">
          <Sparkles className="w-3.5 h-3.5" />
          {customer.loyaltyPoints} PTS
        </span>
      ),
      sortKey: 'loyaltyPoints',
    },
    {
      header: 'Status',
      accessor: (customer) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider ${
            customer.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {customer.status}
        </span>
      ),
      sortKey: 'status',
    },
    {
      header: 'Actions',
      accessor: (customer) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id)}
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => toggleCustomerBan(customer.id, customer.status)}
            className={`p-2 rounded-lg transition-colors border ${
              customer.status === 'active'
                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
            }`}
            title={customer.status === 'active' ? 'Ban Account' : 'Activate Account'}
          >
            {customer.status === 'active' ? (
              <Ban className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          Customer Directory
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Audit customer profiles, loyalty scores, status logs and purchase details.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* Table View */}
        <div className={selectedCustomer ? 'xl:col-span-2 space-y-6' : 'xl:col-span-3 space-y-6'}>
          <DataTable
            data={customers}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search customer directory..."
            rowKey={(c) => c.id}
            initialSort={{ key: 'name', direction: 'asc' }}
            pageSize={10}
          />
        </div>

        {/* Selected Customer Inspect card */}
        {selectedCustomer && (
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5 sticky top-28 animate-fade-in">
            <div className="flex justify-between items-start pb-4 border-b border-zinc-900">
              <h3 className="text-xs font-mono font-bold text-light-gold uppercase tracking-widest">
                Account Inspection
              </h3>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono uppercase font-semibold"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col items-center py-4 border-b border-zinc-900/60 gap-3 text-center">
              <div className="w-20 h-20 rounded-full border-2 border-primary-gold/20 bg-zinc-900 overflow-hidden p-1">
                {selectedCustomer.profileImage ? (
                  <img
                    src={selectedCustomer.profileImage}
                    alt={selectedCustomer.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-zinc-700 mx-auto mt-3" />
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-zinc-100">{selectedCustomer.name}</h4>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${
                    selectedCustomer.status === 'active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {selectedCustomer.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 py-2 text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="truncate">{selectedCustomer.email}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span>Joined: {selectedCustomer.joinDate}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="font-sans">
                  Loyalty Rank:{' '}
                  <span className="font-mono font-bold text-light-gold">
                    {selectedCustomer.loyaltyPoints} points
                  </span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-5 text-center">
              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 tracking-wider font-mono">ORDERS</span>
                <p className="text-xl font-bold font-mono text-zinc-200">
                  {selectedCustomer.ordersCount}
                </p>
              </div>

              <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1">
                <span className="text-[10px] text-zinc-500 tracking-wider font-mono">REPAIRS</span>
                <p className="text-xl font-bold font-mono text-zinc-200">
                  {selectedCustomer.repairRequestsCount}
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <span className="text-zinc-500">Loyalty Status:</span>
              <span className="font-bold text-zinc-200">
                {selectedCustomer.loyaltyPoints > 5000
                  ? 'Blue Sovereign'
                  : selectedCustomer.loyaltyPoints > 1000
                  ? 'Elite Blue'
                  : 'Classic Member'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
