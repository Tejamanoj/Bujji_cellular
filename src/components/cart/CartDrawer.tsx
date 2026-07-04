'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, showToast } = useUIStore();
  const { items, updateQuantity, removeItem, coupon, applyCoupon, removeCoupon, getTotals } = useCartStore();
  const [couponCode, setCouponCode] = useState('');

  const { subtotal, discount, shipping, total, freeShippingProgress } = getTotals();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim() === '') return;
    const success = applyCoupon(couponCode);
    if (success) {
      showToast(`Coupon "${couponCode.toUpperCase()}" applied!`, 'success');
      setCouponCode('');
    } else {
      showToast('Invalid coupon code. Try BUJJI10 or GOLD20.', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer body */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="w-screen max-w-md bg-[#080808] border-l border-white/6 shadow-[0_0_60px_rgba(212,175,55,0.06)]"
            >
              <div className="h-full flex flex-col justify-between">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/5 bg-[#080808] flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-primary-gold">
                    <ShoppingBag size={18} />
                    <h3 className="font-display font-semibold text-lg text-gold-gradient">Shopping Cart</h3>
                  </div>
                  <button onClick={closeCart} className="text-zinc-400 hover:text-white p-1">
                    <X size={20} />
                  </button>
                </div>

                {/* Main scroll content */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                  {/* Free shipping progress bar */}
                  {items.length > 0 && (
                    <div className="ultra-glass p-4 rounded-xl space-y-2 border border-white/5">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">
                          {freeShippingProgress >= 100
                            ? 'You unlocked FREE shipping!'
                            : `Add ₹${(150 - (subtotal - discount)).toFixed(0)} more for free shipping`}
                        </span>
                        <span className="font-semibold text-primary-gold">
                          {freeShippingProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-dark-gold to-primary-gold h-full rounded-full transition-all duration-500"
                          style={{ width: `${freeShippingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Cart items list */}
                  {items.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center">
                      <ShoppingBag size={48} className="text-zinc-700 animate-bounce" />
                      <div>
                        <p className="text-sm font-semibold text-zinc-300">Your cart is empty</p>
                        <p className="text-xs text-zinc-500 mt-1">Explore our models to add premium accessories.</p>
                      </div>
                      <button
                        onClick={closeCart}
                        className="gold-btn-outline px-6 py-2 text-xs uppercase tracking-wider"
                      >
                        Start Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {items.map((item) => (
                        <div key={item.id} className="py-4 flex space-x-4">
                          <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-zinc-200 truncate">{item.product.name}</h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              {item.selectedColor} / {item.selectedStorage}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2 bg-zinc-900 border border-zinc-800 rounded-full px-2 py-0.5">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="text-zinc-400 hover:text-white p-0.5"
                                >
                                  <Minus size={10} />
                                </button>
                                <span className="text-xs font-semibold text-zinc-200 px-1">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="text-zinc-400 hover:text-white p-0.5"
                                >
                                  <Plus size={10} />
                                </button>
                              </div>

                              {/* Price and delete */}
                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-bold text-primary-gold">
                                  ₹{item.product.price * item.quantity}
                                </span>
                                <button
                                  onClick={() => {
                                    removeItem(item.id);
                                    showToast('Item removed from cart', 'warning');
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
                  )}
                </div>

                {/* Footer totals */}
                {items.length > 0 && (
                  <div className="px-6 py-6 border-t border-white/5 bg-[#080808] space-y-4">
                    {/* Coupon Input */}
                    {coupon ? (
                      <div className="flex items-center justify-between bg-zinc-900 px-3.5 py-2.5 rounded-lg border border-primary-gold/20">
                        <div className="flex items-center space-x-2">
                          <Tag size={12} className="text-primary-gold" />
                          <span className="text-xs text-zinc-300 font-bold">{coupon.code} (-{coupon.discountPercent}%)</span>
                        </div>
                        <button onClick={removeCoupon} className="text-zinc-500 hover:text-red-400 text-xs">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Coupon code (e.g. BUJJI10)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 bg-white/3 border border-white/6 px-3 py-2 text-xs rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold"
                        />
                        <button
                          type="submit"
                          className="bg-white/4 border border-white/8 text-zinc-300 px-3 py-2 rounded-xl text-xs font-semibold hover:border-primary-gold/50 transition-colors"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount</span>
                          <span>-₹{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/5">
                        <span>Total</span>
                        <span className="text-primary-gold">₹{total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Link href="/checkout" onClick={closeCart} className="w-full block">
                      <button className="btn-gold w-full py-3.5 text-xs uppercase tracking-widest flex items-center justify-center space-x-2">
                        <span>Proceed to Checkout</span>
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default CartDrawer;
