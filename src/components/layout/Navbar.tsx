'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Menu, X, LogOut, Settings, Shield, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const { items } = useCartStore();
  const { wishlist } = useUserStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { openCart } = useUIStore();

  if (pathname?.startsWith('/admin')) return null;

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Products', href: '/products' },
    { name: 'Repairs', href: '/repair-requests' },
    { name: 'Careers', href: '/jobs' },
    { name: 'Support', href: '/support' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <nav
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-[#080808]/90 backdrop-blur-xl border-b border-white/6 shadow-[0_4px_30px_rgba(0,0,0,0.6)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-[68px]">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-primary-gold flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.4)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.6)] transition-shadow">
              <Sparkles size={14} className="text-black" />
            </div>
            <span className="font-display font-black text-base tracking-wider text-white group-hover:text-primary-gold transition-colors">
              BUJJI <span className="text-primary-gold">CELLULARS</span>
            </span>
          </Link>

          {/* ── DESKTOP LINKS ── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-[11px] font-semibold tracking-[0.18em] uppercase transition-colors group ${
                  pathname.startsWith(link.href) ? 'text-primary-gold' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-0.5 left-0 h-px bg-primary-gold transition-all duration-300 ${
                  pathname.startsWith(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </Link>
            ))}
          </div>

          {/* ── DESKTOP SEARCH ── */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              suppressHydrationWarning
              className="w-44 bg-white/4 border border-white/8 px-4 py-2 pl-9 rounded-full text-[11px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-primary-gold/50 focus:w-56 focus:bg-white/6 transition-all duration-300"
            />
            <Search className="absolute left-3 text-zinc-600" size={13} />
          </form>

          {/* ── ICON ACTIONS ── */}
          <div className="hidden md:flex items-center gap-5">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-zinc-500 hover:text-white transition-colors">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-gold text-black text-[8px] font-black rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button onClick={openCart} className="relative text-zinc-500 hover:text-white transition-colors">
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-gold text-black text-[8px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth */}
            <div className="relative">
              {isAuthenticated && user ? (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-8 h-8 rounded-full border border-primary-gold/40 bg-zinc-900 overflow-hidden flex items-center justify-center hover:border-primary-gold transition-colors"
                  >
                    {user.profileImage
                      ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      : <User size={14} className="text-zinc-400" />
                    }
                  </button>
                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        className="absolute right-0 mt-3 w-52 bg-[#111]/90 backdrop-blur-xl rounded-2xl border border-white/8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-2 z-50"
                      >
                        <div className="px-3 py-2.5 border-b border-white/6 mb-1">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
                        </div>
                        {[
                          { href: '/profile', icon: <Settings size={13} />, label: 'My Profile' },
                          { href: '/orders', icon: <Shield size={13} />, label: 'Orders' },
                        ].map(({ href, icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-[11px] text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                          >
                            {icon} {label}
                          </Link>
                        ))}
                        <button
                          onClick={() => { logout(); setProfileDropdownOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] text-red-400 hover:bg-red-950/20 rounded-xl transition-colors text-left mt-1 border-t border-white/5 pt-2"
                        >
                          <LogOut size={13} /> Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="btn-gold inline-flex items-center gap-1.5 text-[11px] px-4 py-2"
                >
                  <User size={13} /> Login
                </Link>
              )}
            </div>
          </div>

          {/* ── MOBILE ICONS ── */}
          <div className="flex md:hidden items-center gap-4">
            <button onClick={openCart} className="relative text-zinc-400 hover:text-white">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-gold text-black text-[8px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-white/6 overflow-hidden"
          >
            <div className="px-5 py-6 space-y-5">
              <form onSubmit={handleSearchSubmit} className="flex items-center relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/4 border border-white/8 px-4 py-2.5 pl-9 rounded-full text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-primary-gold/50"
                />
                <Search className="absolute left-3 text-zinc-600" size={14} />
              </form>
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-sm font-semibold tracking-widest uppercase py-3 border-b border-white/5 ${
                      pathname.startsWith(link.href) ? 'text-primary-gold' : 'text-zinc-400'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="pt-2">
                {isAuthenticated && user ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-primary-gold/30 bg-zinc-900 flex items-center justify-center">
                        <User size={14} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="text-xs text-red-400 text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-gold inline-flex items-center justify-center w-full py-3 text-sm"
                  >
                    Login / Signup
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
