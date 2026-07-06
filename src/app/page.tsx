'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Shield, Cpu, Award, Zap, Star, Wrench } from 'lucide-react';
import Hero3D from '@/components/home/Hero3D';
import { useProductStore } from '@/store/productStore';
import { FlashSaleSection } from '@/components/home/FlashSaleSection';
import { FeaturedShowcase } from '@/components/home/FeaturedShowcase';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';

/* ─────────────────────────────────────────
   Marquee ticker
───────────────────────────────────────── */
const MARQUEE_ITEMS = [
  '24K Gold Plating', '✦', 'Premium Devices', '✦', 'Expert Repairs', '✦',
  'Solid-State Battery', '✦', 'IPX8 Certified', '✦', 'Holographic Display', '✦',
  'Fast Dispatch', '✦', 'Luxury Service', '✦',
];

function MarqueeTicker() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden py-4 border-y border-white/5">
      <div className="marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`mx-6 text-xs font-semibold tracking-[0.18em] uppercase whitespace-nowrap ${
              item === '✦' ? 'text-primary-gold' : 'text-zinc-500'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Gold particles (client only)
───────────────────────────────────────── */
function Particles() {
  const [pts, setPts] = React.useState<{ x: number; y: number; s: number; d: number; del: number }[]>([]);
  React.useEffect(() => {
    setPts(
      [...Array(22)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2.5 + 0.8,
        d: Math.random() * 14 + 10,
        del: Math.random() * 8,
      }))
    );
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pts.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-primary-gold"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.s, height: p.s, opacity: 0.18 }}
          animate={{ y: [-8, -100, -8], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.d, repeat: Infinity, delay: p.del, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Stat block
───────────────────────────────────────── */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="stat-card px-6 py-5 text-center">
      <p className="text-2xl font-display font-black text-primary-gold mb-1">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-semibold">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function HomePage() {
  const { products, fetchProducts } = useProductStore();
  const featured = products.filter(p => p.featured);
  const flashSale = products.filter(p => p.flashSale);

  useEffect(() => {
    fetchProducts();
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -60]);

  return (
    <div className="relative site-bg min-h-screen">
      <Particles />

      {/* ══════════════════════════════════
          AMBIENT GLOWS (subtle, non-muddy)
      ══════════════════════════════════ */}
      <div
        className="ambient-gold top-[-10%] left-[-5%] w-[500px] h-[500px] opacity-[0.09]"
        style={{ background: '#D4AF37' }}
      />
      <div
        className="ambient-gold bottom-[10%] right-[-8%] w-[450px] h-[450px] opacity-[0.06]"
        style={{ background: '#D4AF37' }}
      />

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex flex-col">

        {/* Top label row */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-7xl mx-auto w-full px-6 sm:px-10 pt-28 pb-0 flex items-center justify-between"
        >
          <span className="inline-flex items-center gap-2 border border-primary-gold/25 bg-primary-gold/8 px-4 py-2 rounded-full text-[11px] text-primary-gold font-bold tracking-[0.22em] uppercase">
            ✦ &nbsp; India&apos;s Premium Mobile Destination
          </span>
          <Link href="/products" className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-primary-gold transition-colors tracking-widest uppercase font-semibold group">
            Browse All <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Main headline + 3D */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-10 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 items-center py-16"
        >
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
            className="space-y-10"
          >
            {/* Giant headline */}
            <div>
              <motion.h1
                className="font-display font-black leading-[0.93] tracking-tight text-[clamp(3.5rem,9vw,7.5rem)] text-white"
              >
                Gold
                <br />
                <span className="text-hero-gradient">Standard.</span>
                <br />
                <span className="text-zinc-600">Mobile.</span>
              </motion.h1>
            </div>

            <div className="max-w-md space-y-6">
              <p className="text-zinc-400 text-base leading-relaxed">
                Bujji Cellulars crafts luxury smartphones with 24K gold finishes, solid-state batteries & holographic displays — made for those who demand more.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    suppressHydrationWarning
                    className="btn-gold inline-flex items-center gap-2.5 text-sm px-8 py-3.5 cursor-pointer"
                  >
                    Shop Collection <ArrowRight size={15} />
                  </motion.button>
                </Link>
                <Link href="/repair-requests">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    suppressHydrationWarning
                    className="btn-outline inline-flex items-center gap-2.5 text-sm px-8 py-3.5 cursor-pointer"
                  >
                    <Wrench size={14} /> Book Repair
                  </motion.button>
                </Link>
              </div>
            </div>

            {/* Stat strip */}
            <div className="grid grid-cols-3 gap-3">
              <Stat value="50+" label="Devices" />
              <Stat value="4.9★" label="Avg Rating" />
              <Stat value="24h" label="Dispatch" />
            </div>
          </motion.div>

          {/* 3D Phone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
            className="relative h-[460px] md:h-[600px]"
          >
            <div className="absolute inset-0 rounded-full bg-primary-gold/6 blur-[100px] pointer-events-none" />
            <Hero3D />
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ scaleY: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-px h-12 bg-gradient-to-b from-primary-gold to-transparent origin-top"
          />
          <span className="text-[9px] text-zinc-600 uppercase tracking-[0.25em]">Scroll</span>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          MARQUEE
      ══════════════════════════════════ */}
      <div className="relative z-10">
        <MarqueeTicker />
      </div>

      {/* ══════════════════════════════════
          FLASH SALE
      ══════════════════════════════════ */}
      <div className="relative z-10">
        {flashSale.length > 0 && <FlashSaleSection products={flashSale} />}
      </div>

      <div className="neon-line mx-8 sm:mx-20" />

      {/* ══════════════════════════════════
          FEATURED SHOWCASE
      ══════════════════════════════════ */}
      <div className="relative z-10">
        {featured.length > 0 && <FeaturedShowcase products={featured} />}
      </div>

      <div className="neon-line mx-8 sm:mx-20" />

      {/* ══════════════════════════════════
          WHY BUJJI — feature grid
      ══════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24"
      >
        <div className="mb-14">
          <p className="text-[11px] text-primary-gold tracking-[0.3em] uppercase font-bold mb-3">Why Bujji</p>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-white leading-tight">
            Crafted for the <br />
            <span className="text-gold-gradient">Extraordinary.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Award size={22} />, title: '2-Year Warranty', desc: 'Full luxury coverage on every device we sell.' },
            { icon: <Zap size={22} />, title: 'Ships in 24h', desc: 'Same-day dispatch with express delivery options.' },
            { icon: <Shield size={22} />, title: '100% Secure', desc: '256-bit encrypted checkout. Your data is safe.' },
            { icon: <Cpu size={22} />, title: 'Expert Repairs', desc: 'Certified technicians for precision repair work.' },
          ].map(({ icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
              className="ultra-glass rounded-2xl p-6 group cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-gold/10 border border-primary-gold/20 flex items-center justify-center text-primary-gold mb-5 group-hover:bg-primary-gold group-hover:text-black transition-all">
                {icon}
              </div>
              <h3 className="font-display font-bold text-sm text-white mb-2">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <div className="neon-line mx-8 sm:mx-20" />

      {/* ══════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════ */}
      <div className="relative z-10">
        <TestimonialsSection />
      </div>

      {/* ══════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9 }}
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-24"
      >
        <div className="ultra-glass rounded-3xl overflow-hidden relative">
          {/* top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-gold/60 to-transparent" />

          <div className="px-10 py-16 sm:px-20 sm:py-20 text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] text-primary-gold tracking-[0.35em] uppercase font-bold mb-6"
            >
              Exclusive Access
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl font-display font-black text-white mb-5 leading-tight"
            >
              Elevate Your
              <br />
              <span className="text-hero-gradient">Mobile Experience.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 text-sm max-w-md mx-auto mb-10 leading-relaxed"
            >
              50+ premium devices. Custom repairs. Luxury accessories. Gold-tier service. Only at Bujji Cellulars.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/products">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  suppressHydrationWarning
                  className="btn-gold inline-flex items-center gap-2.5 text-sm px-10 py-4 cursor-pointer"
                >
                  Explore Collection <ArrowRight size={15} />
                </motion.button>
              </Link>
              <Link href="/repair-requests">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  suppressHydrationWarning
                  className="btn-outline inline-flex items-center gap-2.5 text-sm px-10 py-4 cursor-pointer"
                >
                  Book a Repair
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* bottom border glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-gold/30 to-transparent" />
        </div>
      </motion.section>
    </div>
  );
}
