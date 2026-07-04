'use client';

import React from 'react';
import { Star } from 'lucide-react';

export function TestimonialsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="max-w-xl mx-auto mb-12 space-y-3">
        <h2 className="text-xl sm:text-2xl font-display font-black tracking-tight text-white uppercase">
          Accolades from the <span className="text-gold-gradient">Executive Class</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-4 text-left border border-zinc-900">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="fill-primary-gold text-primary-gold" size={12} />
            ))}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
            "The custom engraving and gold bumper exceeded all expectations. It matches my luxury sedan beautifully and handles daily drop impact without any scratch."
          </p>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Charles Sterling</p>
            <p className="text-[9px] text-zinc-500 font-semibold tracking-wider">Managing Director</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl space-y-4 text-left border border-zinc-900">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="fill-primary-gold text-primary-gold" size={12} />
            ))}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
            "AeroBuds Gold are spectacular. The hybrid noise isolation is extremely powerful, and the design looks like a gold sculpture in my ears."
          </p>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Lady Cynthia</p>
            <p className="text-[9px] text-zinc-500 font-semibold tracking-wider">Venture Partner</p>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-xl space-y-4 text-left border border-zinc-900">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="fill-primary-gold text-primary-gold" size={12} />
            ))}
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-medium italic">
            "My repair bumper plate took 2 days. The pickup service is quick and the online chat kept me updated hourly. Outstanding client service!"
          </p>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider">Vikram Reddy</p>
            <p className="text-[9px] text-zinc-500 font-semibold tracking-wider">Tech Founder</p>
          </div>
        </div>
      </div>
    </section>
  );
}
