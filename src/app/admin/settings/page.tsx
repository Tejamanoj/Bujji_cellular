'use client';

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Mail, HelpCircle, Truck, Database } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Bujji Cellulars');
  const [storeEmail, setStoreEmail] = useState('contact@bujjicellulars.com');
  const [shippingRate, setShippingRate] = useState(15);
  const [taxRate, setTaxRate] = useState(8.25);
  const [allowPromo, setAllowPromo] = useState(true);
  
  // Notification states
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewRepair, setNotifyNewRepair] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System settings stored successfully in server cache!');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          System Configuration
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Manage system limits, shipping rates, VAT percentages, and webhook notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* General Metadata */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              General Metadata
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Store Catalog Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">System Notification Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
              />
            </div>
          </div>

          {/* Shipping and Taxes */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-zinc-500" />
              Taxes & Logistic Config
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Courier Delivery Fee (?)</label>
                <input
                  type="number"
                  value={shippingRate}
                  onChange={(e) => setShippingRate(Number(e.target.value))}
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Standard Sales Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-zinc-200">Accept Promo Codes</p>
                <p className="text-zinc-500">Allow customers to use coupon codes at checkouts.</p>
              </div>
              <input
                type="checkbox"
                checked={allowPromo}
                onChange={(e) => setAllowPromo(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Webhook Notifications */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-zinc-500" />
              Operation Webhooks & Logs
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/60">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Notify low inventory limits</p>
                  <p className="text-zinc-500 text-[11px]">Send notification email when products have &lt; 10 units.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyLowStock}
                  onChange={(e) => setNotifyLowStock(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/60">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Notify new repair tickets</p>
                  <p className="text-zinc-500 text-[11px]">Receive notification logs for all repair pickups.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyNewRepair}
                  onChange={(e) => setNotifyNewRepair(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs py-2">
                <div className="space-y-0.5">
                  <p className="font-semibold text-zinc-200">Instant order updates</p>
                  <p className="text-zinc-500 text-[11px]">Push message triggers for customer order states.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyOrders}
                  onChange={(e) => setNotifyOrders(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Database & Operations panel */}
        <div className="sticky top-28 space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500" />
              Backup & Seeds
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              Perform administrative operations to format local storage mock caches or download sales records.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => alert('Mock transaction logs exported in CSV format!')}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl transition-all"
              >
                Export Order Ledger
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to restore default mock data? All customizations will be reset.')) {
                    alert('Mock database state restored to defaults!');
                    window.location.reload();
                  }
                }}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 rounded-xl transition-all"
              >
                Reset Mock Database
              </button>
            </div>
          </div>

          {/* Submit floating button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-amber-400 to-yellow-500 font-bold text-xs text-black rounded-xl hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
