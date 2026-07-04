'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('System Exception boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-500/4 blur-[120px] pointer-events-none" />

      <div className="space-y-8 relative z-10 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-rose-500/8 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.08)]">
          <AlertOctagon className="w-9 h-9 animate-pulse" />
        </div>

        <div className="space-y-3">
          <span className="font-mono text-[10px] font-bold text-rose-400/80 tracking-[0.3em] uppercase">
            System Exception Boundary
          </span>
          <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white uppercase leading-none">
            Operation<br />
            <span className="text-rose-400">Failure.</span>
          </h1>
          {error.digest && (
            <p className="text-[10px] text-zinc-600 font-mono select-all tracking-wider">
              DIGEST: {error.digest}
            </p>
          )}
          <p className="text-sm text-zinc-500 leading-relaxed font-sans">
            A secure subsystem raised a critical exception during runtime. Our technicians have been notified.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={reset}
            className="btn-gold inline-flex items-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry Connection
          </button>

          <Link href="/">
            <button className="btn-outline inline-flex items-center gap-2 px-7 py-3.5 text-xs font-bold uppercase tracking-wider">
              <Home className="w-3.5 h-3.5" />
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
