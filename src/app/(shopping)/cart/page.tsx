'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';

export default function CartPage() {
  const { items, updateQuantity, removeItem, coupon, applyCoupon, removeCoupon, getTotals } = useCartStore();
  const { toggleWishlist, wishlist } = useUserStore();
  const { showToast } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [couponCode, setCouponCode] = useState('');
  
  const { subtotal, discount, shipping, total, freeShippingProgress } = getTotals();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim() === '') return;
    const success = applyCoupon(couponCode);
    if (success) {
      showToast(`Coupon applied: ${couponCode.toUpperCase()}`, 'success');
      setCouponCode('');
    } else {
      showToast('Invalid coupon. Try BUJJI10 or GOLD20.', 'error');
    }
  };

  const handleSaveForLater = (item: any) => {
    if (!isAuthenticated || !user) {
      showToast('Please log in to save items to your wishlist.', 'error');
      return;
    }
    // Add to wishlist
    if (!wishlist.includes(item.product.id)) {
      toggleWishlist(user.id, item.product.id);
    }
    // Remove from cart
    removeItem(item.id);
    showToast('Saved item to your wishlist.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Your Selection</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Shopping Cart</h1>
        <p className="text-sm text-zinc-500 mt-2">Review your selection and checkout your premium assets.</p>
      </div>

      {items.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center ultra-glass border border-white/5 rounded-2xl p-6">
          <ShoppingBag size={48} className="text-zinc-700 animate-bounce" />
          <div>
            <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
            <p className="text-xs text-zinc-500 mt-1">Select from our luxury smartphone configurations to begin.</p>
          </div>
          <Link href="/products">
            <button className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
              Start Shopping
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping banner */}
            <div className="ultra-glass p-4 rounded-xl space-y-2 border border-primary-gold/20">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">
                  {freeShippingProgress >= 100
                    ? 'Congratulations! You unlocked FREE shipping.'
                    : `Add ₹${(150 - (subtotal - discount)).toFixed(0)} more for FREE Air Express shipping`}
                </span>
                <span className="text-primary-gold">{freeShippingProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-dark-gold to-primary-gold h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="ultra-glass rounded-xl border border-white/5 hover:border-primary-gold/20 p-4 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center transition-all duration-300">
                  {/* Photo */}
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 border border-white/8">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Body details */}
                  <div className="flex-1 min-w-0 text-left space-y-1.5 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-display font-semibold text-xs sm:text-sm text-white truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-zinc-500">
                          Finish: {item.selectedColor} / Config: {item.selectedStorage}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-primary-gold">₹{item.product.price * item.quantity}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      {/* Qty controls */}
                      <div className="flex items-center space-x-2.5 bg-zinc-900 rounded-full px-2.5 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-zinc-400 hover:text-white p-0.5">
                          <Minus size={10} />
                        </button>
                        <span className="text-xs font-bold text-zinc-200 px-1">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-zinc-400 hover:text-white p-0.5">
                          <Plus size={10} />
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleSaveForLater(item)}
                          className="flex items-center space-x-1 text-[10px] uppercase font-bold text-zinc-500 hover:text-primary-gold transition-colors"
                        >
                          <Heart size={10} />
                          <span>Save for Later</span>
                        </button>
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            showToast('Item removed from cart.', 'warning');
                          }}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Totals Column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Coupon widget */}
            <div className="ultra-glass p-5 rounded-xl border border-white/5 space-y-3">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-300">Coupons</h3>
              {coupon ? (
                <div className="flex items-center justify-between bg-zinc-900/60 border border-primary-gold/20 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2 text-xs">
                    <Tag size={12} className="text-primary-gold" />
                    <span className="font-bold text-zinc-200">{coupon.code} (-{coupon.discountPercent}%)</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-400 hover:text-red-300 text-xs">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-white/3 border border-white/6 px-3.5 py-2 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold"
                  />
                  <button
                    type="submit"
                    className="bg-white/4 hover:border-primary-gold/50 transition-colors border border-white/8 text-xs font-semibold px-3 py-2 rounded-xl text-zinc-300 hover:text-white"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Totals panel */}
            <div className="ultra-glass p-5 rounded-xl border border-white/5 space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-zinc-300">Checkout Summary</h3>
              <div className="space-y-2 text-xs text-zinc-400 divide-y divide-white/5">
                <div className="flex justify-between py-1.5">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 py-1.5">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span>Shipping</span>
                  <span className="text-zinc-200">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-3">
                  <span>Total</span>
                  <span className="text-primary-gold">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full pt-2">
                <button className="btn-gold w-full py-3.5 text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                  <span>Secure Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
