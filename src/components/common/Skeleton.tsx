import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded h-3 w-full';
      case 'rectangular':
      default:
        return 'rounded-md';
    }
  };

  const customStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={`animate-pulse bg-zinc-800/60 border border-zinc-700/30 ${getVariantClass()} ${className}`}
      style={customStyle}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-zinc-850 bg-black/40 backdrop-blur-md rounded-2xl p-4 flex flex-col gap-4">
      <Skeleton variant="rectangular" height={192} className="w-full rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="90%" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="rectangular" width={80} height={32} className="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-900/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" width={i === 0 ? '80%' : '50%'} height={16} />
        </td>
      ))}
    </tr>
  );
}
