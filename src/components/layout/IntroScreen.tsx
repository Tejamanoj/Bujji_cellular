'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

export const IntroScreen: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if the intro has already played in this browser session
    const hasPlayed = sessionStorage.getItem('bujji_intro_played');
    if (!hasPlayed) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem('bujji_intro_played', 'true');
      }, 3000); // 3 seconds play duration
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#000000] flex flex-col items-center justify-center text-center p-6 select-none pointer-events-none"
        >
          {/* Outer radial ambient glow */}
          <div className="absolute w-[350px] h-[350px] bg-[#111184]/15 blur-[90px] rounded-full" />

          {/* Animated Blue Shield Logo */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative w-20 h-20 bg-gradient-to-br from-[#2a2ab8] via-[#111184] to-[#0a0a54] rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(17,17,132,0.4)] mb-6 border border-white/10"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>

          {/* Brand Name */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#4f4fe3] to-[#111184] tracking-[0.25em] uppercase"
          >
            Bujji Cellulars
          </motion.h2>

          {/* Premium Tagline */}
          <motion.p
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 0.6 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xs font-mono text-zinc-300 uppercase tracking-[0.35em] mt-3 font-semibold"
          >
            India&apos;s Premium Mobile Destination
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default IntroScreen;
