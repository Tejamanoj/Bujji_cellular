'use client';

import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Bell, Search, User, ShieldAlert, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen site-bg text-zinc-100 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-20 bg-[#080808]/90 border-b border-white/5 backdrop-blur-md px-6 md:px-8 flex items-center justify-between">
          {/* Quick Search */}
          <div className="relative max-w-xs w-full hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search administration..."
              className="w-full bg-white/3 border border-white/8 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-primary-gold/40 text-zinc-200 placeholder-zinc-600 transition-colors"
            />
          </div>

          <div className="sm:hidden flex items-center">
            <span className="font-bold font-mono tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
              BUJJI CELLULARS
            </span>
          </div>

          {/* Right Header Operations */}
          <div className="flex items-center gap-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Server
            </div>

            {/* Notification Bell */}
            <button className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-400 hover:border-amber-500/20 transition-all duration-200 relative group">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 border border-zinc-900" />
              
              {/* Simple Mock Notifications Dropdown */}
              <div className="absolute right-0 top-full mt-3 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-4 opacity-0 invisible group-focus-within:opacity-100 group-focus-within:visible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-left">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800 mb-2">
                  <h4 className="text-xs font-bold text-zinc-300 font-mono uppercase tracking-wider">Notifications</h4>
                  <span className="text-[10px] text-amber-400 cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="space-y-3 py-1">
                  <div className="text-xs space-y-1">
                    <p className="text-zinc-300 font-medium">New Repair Request #rep_102</p>
                    <p className="text-[10px] text-zinc-500 font-mono">10 minutes ago</p>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-zinc-300 font-medium">Out of Stock alert: Glacier Gold Case</p>
                    <p className="text-[10px] text-zinc-500 font-mono">2 hours ago</p>
                  </div>
                </div>
              </div>
            </button>

            <div className="w-px h-6 bg-zinc-800" />

            {/* Admin Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800/80 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                  alt="Admin Profile"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-300">Teja M</span>
                <span className="text-[9px] text-zinc-500 tracking-wider font-mono uppercase font-bold text-amber-500">
                  Superadmin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
