'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Hero3D: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[450px] flex items-center justify-center">
      {/* Outer Phone Container */}
      <div className="relative w-[300px] h-[600px] rounded-[50px] border-4 border-[#D4AF37]/40 bg-[#0a0a0a] shadow-[0_25px_60px_-15px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Phone Dynamic Island/Notch Mockup */}
        <div className="absolute top-4 w-28 h-6 bg-[#000] rounded-full border border-white/5 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ml-auto mr-3 border border-white/10" />
        </div>

        {/* Outer Circular Rings around the main badge */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#D4AF37]/25 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-[#D4AF37]/15" />
          
          {/* Central Gold Glowing Circle with Star Icon */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#AA7C11] via-[#D4AF37] to-[#F3E5AB] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            {/* Sparkle/Star Icon */}
            <svg className="w-12 h-12 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z" />
            </svg>
          </motion.div>
        </div>

        {/* Text Metadata */}
        <div className="mt-8 text-center space-y-3 z-10">
          <p className="text-[10px] font-mono text-[#D4AF37] tracking-[0.3em] uppercase font-bold">
            BUJJI GOLD
          </p>
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">
            PHANTOM-X
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
            24K Gold electroplating with Liquid Titanium core.
          </p>
        </div>

        {/* Subtle decorative edge lines inside device screen */}
        <div className="absolute inset-x-0 bottom-12 flex justify-center">
          <div className="w-1/3 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default Hero3D;
