'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend: number; // e.g. 14.2 or -5.4
  trendLabel?: string;
  loading?: boolean;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  loading = false,
}: StatsCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="relative overflow-hidden border border-zinc-800/80 bg-gradient-to-br from-zinc-950 to-zinc-900/90 rounded-2xl p-6 transition-all duration-300 hover:border-yellow-500/30 hover:shadow-xl hover:shadow-yellow-500/[0.02] group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl transition-opacity duration-300 group-hover:bg-amber-500/10 pointer-events-none" />

      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-xs font-mono font-medium tracking-widest text-zinc-500 uppercase">
            {label}
          </p>
          {loading ? (
            <div className="h-9 w-28 bg-zinc-800 animate-pulse rounded" />
          ) : (
            <h3 className="text-3xl font-bold text-zinc-100 tracking-tight">
              {value}
            </h3>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-amber-400 group-hover:text-black group-hover:bg-gradient-to-br group-hover:from-amber-400 group-hover:to-yellow-500 transition-all duration-300">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {isPositive ? '+' : ''}
          {trend.toFixed(1)}%
        </span>
        <span className="text-xs text-zinc-500 font-medium tracking-wide">
          {trendLabel}
        </span>
      </div>
    </div>
  );
}
