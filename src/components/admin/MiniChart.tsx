'use client';

import React, { useState } from 'react';

interface BarData {
  date: string;
  amount: number;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
}

export function MiniBarChart({ data, height = 200 }: MiniBarChartProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const chartHeight = height - 40; // reserve space for text
  
  return (
    <div className="w-full flex flex-col justify-end bg-black/30 border border-zinc-900 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-end justify-between gap-2 md:gap-4 h-[160px] relative">
        {/* Y Axis Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-t border-zinc-900/60" />
          <div className="w-full border-t border-zinc-900/60" />
          <div className="w-full border-t border-zinc-900/60" />
          <div className="w-full border-t border-zinc-900/60" />
        </div>

        {data.map((d, i) => {
          const barHeight = (d.amount / maxVal) * chartHeight;
          const isHovered = hoveredBar === i;

          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group relative cursor-pointer"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip */}
              <div
                className={`absolute bottom-full mb-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-xs font-mono font-bold rounded-lg text-amber-400 shadow-xl pointer-events-none transition-all duration-200 z-10 ${
                  isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95'
                }`}
              >
                ${d.amount.toLocaleString()}
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[28px] rounded-t-lg transition-all duration-300 relative"
                style={{
                  height: `${Math.max(barHeight, 8)}px`,
                  background: isHovered
                    ? 'linear-gradient(to top, #ca8a04, #f59e0b, #fbbf24)'
                    : 'linear-gradient(to top, #18181b, #71717a, #ca8a04)',
                  boxShadow: isHovered ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
                }}
              >
                {/* Glowing cap */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 rounded-t-lg" />
              </div>
            </div>
          );
        })}
      </div>

      {/* X Labels */}
      <div className="flex justify-between mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest pt-2 border-t border-zinc-900">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center font-semibold">
            {d.date}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutData {
  category: string;
  value: number;
}

interface MiniDonutChartProps {
  data: DonutData[];
}

export function MiniDonutChart({ data }: MiniDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = [
    '#f59e0b', // Amber-500
    '#ca8a04', // Yellow-600
    '#71717a', // Zinc-500
    '#3f3f46', // Zinc-700
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  
  // Circle details
  const radius = 55;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-6 bg-black/30 border border-zinc-900 rounded-2xl p-6 backdrop-blur-md">
      {/* SVG Circle */}
      <div className="relative w-[150px] h-[150px] flex items-center justify-center flex-shrink-0">
        <svg width="150" height="150" className="transform -rotate-90">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="#18181b"
            strokeWidth={strokeWidth}
          />
          {data.map((d, i) => {
            const percentage = d.value / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - strokeLength + currentOffset;
            
            // Increment offset for next slice
            currentOffset -= strokeLength;

            const isHovered = hoveredIdx === i;

            return (
              <circle
                key={i}
                cx="75"
                cy="75"
                r={radius}
                fill="transparent"
                stroke={colors[i % colors.length]}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div className="absolute text-center flex flex-col pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            {hoveredIdx !== null ? data[hoveredIdx].category : 'Total'}
          </span>
          <span className="text-xl font-bold text-zinc-100">
            {hoveredIdx !== null ? `${data[hoveredIdx].value}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 grid grid-cols-2 gap-3 w-full">
        {data.map((d, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer border ${
                isHovered
                  ? 'bg-zinc-900 border-zinc-800 scale-[1.02]'
                  : 'bg-transparent border-transparent'
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs text-zinc-400 font-medium truncate">
                  {d.category}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-100">
                  {d.value}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
