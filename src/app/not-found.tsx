'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-gold/4 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-500/6 blur-[80px] pointer-events-none" />

      <div className="space-y-8 relative z-10 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-500/8 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.08)]">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <div className="space-y-3">
          <span className="font-mono text-[10px] font-bold text-amber-500/80 tracking-[0.3em] uppercase">
            Error Coordinates: 404
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white uppercase leading-none">
            Not<br /><span className="text-hero-gradient">Found.</span>
          </h1>
          <p className="text-sm text-zinc-500 font-sans leading-relaxed">
            The page coordinates you requested do not exist in our secure digital catalog ledger. It may have been archived or relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/">
            <button className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider">
              <CornerDownLeft className="w-3.5 h-3.5" />
              Return Home
            </button>
          </Link>
          <Link href="/products">
            <button className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider">
              View Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
