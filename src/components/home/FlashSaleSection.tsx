'use client';

import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Flame, Star, Zap, ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Product } from '@/types';

interface FlashSaleSectionProps {
  products: Product[];
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 400, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DigitBlock({ value }: { value: string }) {
  return (
    <motion.span
      key={value}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="inline-block min-w-[2ch] text-center"
    >
      {value}
    </motion.span>
  );
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();
  const [timeLeft, setTimeLeft] = useState(13338);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 13338 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = String(Math.floor(timeLeft / 3600)).padStart(2, '0');
  const mins = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Flame className="text-red-500" size={28} />
              <div className="absolute inset-0 blur-md bg-red-500/50 rounded-full" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight">
              Flash <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-600">Drop</span>
            </h2>
          </div>
          <p className="text-xs text-zinc-500 font-medium tracking-wider">Limited-time luxury. Strike before time runs out.</p>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2">
          {[{ label: 'HRS', val: hrs }, { label: 'MIN', val: mins }, { label: 'SEC', val: secs }].map(({ label, val }, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center">
                <div className="bg-red-950/60 border border-red-900/70 rounded-xl px-4 py-2.5 font-mono font-black text-2xl text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] min-w-[64px] text-center">
                  <DigitBlock value={val} />
                </div>
                <span className="text-[9px] text-red-700 uppercase tracking-widest mt-1 font-bold">{label}</span>
              </div>
              {i < 2 && <span className="text-red-600 font-black text-2xl mb-4">:</span>}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <TiltCard className="group relative rounded-3xl overflow-hidden ultra-glass cursor-pointer flex flex-col h-full">
              {/* Discount Badge */}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.7)]">
                  <Zap size={9} />
                  Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </div>
              )}

              {/* Image */}
              <div className="relative h-52 overflow-hidden flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Rating pill */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/10">
                  <Star size={10} className="fill-primary-gold text-primary-gold" />
                  <span className="text-[10px] text-white font-bold">{product.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">{product.category}</span>
                  <h3 className="font-display font-bold text-sm text-white mt-1 leading-snug line-clamp-1 group-hover:text-primary-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-xl font-black text-primary-gold">₹{product.price.toLocaleString('en-IN')}</p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-zinc-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { addItem(product, 1, product.colors[0], product.storage[0]); showToast(`${product.name} added!`, 'success'); }}
                    className="w-11 h-11 flex items-center justify-center rounded-2xl bg-primary-gold text-black hover:bg-dark-gold transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  >
                    <ShoppingCart size={17} />
                  </motion.button>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
