'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Users,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Home
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Categories', href: '/admin/categories', icon: ClipboardList },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Repairs', href: '/admin/repairs', icon: Wrench },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 h-screen z-30 flex-shrink-0 flex flex-col bg-[#080808] border-r border-white/5 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-accent-gold to-light-gold flex items-center justify-center shadow-lg shadow-accent-gold/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-light-gold tracking-wider text-sm font-sans uppercase">
                Bujji Admin
              </span>
              <span className="text-[10px] text-zinc-500 tracking-widest font-mono">
                CONTROL CENTER
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-3.5 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-primary-gold/10 to-accent-gold/5 text-light-gold border border-primary-gold/20 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-light-gold" />
              )}
              
              <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? 'text-light-gold' : 'text-zinc-400 group-hover:text-light-gold'
              }`} />

              {!collapsed && <span className="text-sm tracking-wide">{item.name}</span>}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-24 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Operations */}
      <div className="p-3 border-t border-white/5 bg-black/20 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-4 px-3 py-3 rounded-xl text-zinc-400 hover:bg-white/4 hover:text-zinc-200 transition-all group relative`}
        >
          <Home className="w-5 h-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-200" />
          {!collapsed && <span className="text-sm">Main Site</span>}
          {collapsed && (
            <div className="absolute left-24 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-xl whitespace-nowrap z-50">
              Main Site
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-zinc-500 hover:bg-white/4 hover:text-zinc-300 transition-all duration-200 group relative"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">Collapse Menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
