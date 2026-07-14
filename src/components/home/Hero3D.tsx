'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const Hero3D: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[450px] flex items-center justify-center">
      {/* Outer Phone Container */}
      <div className="relative w-[300px] h-[600px] rounded-[50px] border-4 border-[#111184]/40 bg-[#0a0a0a] shadow-[0_25px_60px_-15px_rgba(17,17,132,0.25)] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Phone Dynamic Island/Notch Mockup */}
        <div className="absolute top-4 w-28 h-6 bg-[#000] rounded-full border border-white/5 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ml-auto mr-3 border border-white/10" />
        </div>

        {/* Outer Circular Rings around the main badge */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#111184]/25 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border border-[#111184]/15" />
          
          {/* Central Blue Glowing Circle with Device Icon */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0a0a54] via-[#111184] to-[#4f4fe3] flex items-center justify-center shadow-[0_0_30px_rgba(17,17,132,0.4)]"
          >
            {/* Premium Smartphone Icon */}
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </motion.div>
        </div>

        {/* Text Metadata */}
        <div className="mt-8 text-center space-y-3 z-10">
          <p className="text-[10px] font-mono text-[#D4AF37] tracking-[0.3em] uppercase font-bold">
            PREMIUM PHONES
          </p>
          <h3 className="text-xl font-display font-black text-white uppercase tracking-wider">
            FLAGSHIP PRO
          </h3>
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[200px] mx-auto">
            Premium build, high-refresh display, and all-day battery.
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
