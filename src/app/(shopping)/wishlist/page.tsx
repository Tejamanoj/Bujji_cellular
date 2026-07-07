'use client';

import React from 'react';
import { useUserStore } from '@/store/userStore';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Star, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const { wishlist, toggleWishlist } = useUserStore();
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();

  const wishes = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Saved Items</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Your Wishlist</h1>
        <p className="text-sm text-zinc-500 mt-2">Acquire your saved premium electronics at your discretion.</p>
      </div>

      {wishes.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center ultra-glass border border-white/5 rounded-2xl p-6">
          <ShoppingCart size={40} className="text-zinc-700 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-zinc-300">Your wishlist is empty</p>
            <p className="text-xs text-zinc-500 mt-1">Explore our models to save items for future consideration.</p>
          </div>
          <Link href="/products">
            <button className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
              Start Exploring
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishes.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="group ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 flex flex-col justify-between h-full cursor-pointer transition-all duration-300"
            >
              <div className="p-4">
                <div className="w-full h-40 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (user?.id) {
                        toggleWishlist(user.id, product.id);
                        showToast('Item removed from wishlist.', 'info');
                      } else {
                        showToast('Please log in.', 'error');
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-zinc-950/80 backdrop-blur border border-white/8 text-zinc-400 hover:text-red-500"
                    title="Remove item"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <span className="text-[9px] text-primary-gold font-mono uppercase tracking-widest">{product.brand}</span>
                <h3 className="font-display font-bold text-xs text-zinc-200 group-hover:text-primary-gold truncate mt-1">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Star className="fill-primary-gold text-primary-gold" size={10} />
                  <span className="text-[10px] text-zinc-400">{product.rating}</span>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-white">₹{product.price}</span>
                <button
                  className="btn-gold px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(product, 1, product.colors[0], product.storage[0]);
                    showToast(`${product.name} added to cart!`, 'success');
                  }}
                >
                  Acquire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
