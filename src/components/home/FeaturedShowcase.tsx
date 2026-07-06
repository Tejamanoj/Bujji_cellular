'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ShoppingCart, Star, Zap } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Product } from '@/types';

import { useRouter } from 'next/navigation';

interface FeaturedShowcaseProps {
  products: Product[];
}

// 3D Tilt Card wrapper
function TiltCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-100, 100], [8, -8]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-8, 8]), { stiffness: 400, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }
  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};

export function FeaturedShowcase({ products }: FeaturedShowcaseProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();

  const [hero, ...rest] = products.slice(0, 4);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
      {/* Section Header */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-xs text-primary-gold font-semibold tracking-[0.3em] uppercase mb-2">Curated Collection</p>
          <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-white">
            Featured <span className="text-gold-gradient">Showcase</span>
          </h2>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 hover:text-primary-gold transition-colors font-semibold tracking-wider uppercase group"
        >
          View All
          <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </motion.div>

      {/* BENTO BOX GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* HERO CARD — spans 2 columns */}
        {hero && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="lg:col-span-2"
          >
            <TiltCard 
              className="group relative rounded-3xl overflow-hidden ultra-glass h-[420px] cursor-pointer"
              onClick={() => router.push(`/products/${hero.id}`)}
            >
              {/* Background Image */}
              <img
                src={hero.images[0]}
                alt={hero.name}
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all duration-700 scale-105 group-hover:scale-100"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-primary-gold/20 text-primary-gold text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary-gold/30">
                    ⭐ Featured Pick
                  </span>
                </div>
                <h3 className="font-display font-black text-2xl sm:text-3xl text-white mb-2 leading-tight">{hero.name}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-2 max-w-md">{hero.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-primary-gold">₹{hero.price.toLocaleString('en-IN')}</span>
                  {hero.originalPrice && (
                    <span className="text-sm text-zinc-500 line-through">₹{hero.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                  <div className="ml-auto flex gap-3">
                    <button
                      className="px-5 py-2.5 bg-white/10 backdrop-blur text-white text-xs font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                      onClick={(e) => { e.stopPropagation(); router.push(`/products/${hero.id}`); }}
                    >
                      Explore
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        addItem(hero, 1, hero.colors[0], hero.storage[0]); 
                        showToast(`${hero.name} added to cart!`, 'success'); 
                      }}
                      className="px-5 py-2.5 bg-primary-gold text-black text-xs font-black rounded-xl hover:bg-dark-gold transition-all shadow-[0_0_20px_rgba(212,175,55,0.5)] cursor-pointer"
                    >
                      Acquire
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        )}

        {/* SMALL CARD stack */}
        {rest.map((product, idx) => (
          <motion.div
            key={product.id}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: idx * 0.1, ease: 'easeOut' as const } } }}
          >
            <TiltCard 
              className="group relative rounded-3xl overflow-hidden ultra-glass h-[420px] cursor-pointer flex flex-col"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-2 py-1">
                  <Star size={10} className="fill-primary-gold text-primary-gold" />
                  <span className="text-[10px] text-white font-bold">{product.rating}</span>
                </div>
              </div>
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">{product.category}</span>
                  <h3 className="font-display font-bold text-base text-white mt-1 leading-tight line-clamp-2 group-hover:text-primary-gold transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    <p className="text-lg font-black text-primary-gold">₹{product.price.toLocaleString('en-IN')}</p>
                    {product.originalPrice && (
                      <p className="text-[10px] text-zinc-500 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      addItem(product, 1, product.colors[0], product.storage[0]); 
                      showToast(`${product.name} added!`, 'success'); 
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-2xl bg-primary-gold/10 border border-primary-gold/30 hover:bg-primary-gold hover:text-black text-primary-gold transition-all cursor-pointer"
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {/* Mobile "View All" link */}
      <div className="mt-8 text-center sm:hidden">
        <Link href="/products" className="text-sm text-primary-gold font-semibold underline underline-offset-4">
          View All Products →
        </Link>
      </div>
    </section>
  );
}
