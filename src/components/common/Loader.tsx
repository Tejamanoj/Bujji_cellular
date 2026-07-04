'use client';

import React from 'react';


interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-18 h-18 border-4',
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div
          className={`${sizeClasses[size]} border-t-primary-gold border-r-transparent border-b-primary-gold/30 border-l-transparent rounded-full animate-spin`}
        />
        <div
          className="absolute inset-0 w-full h-full rounded-full border border-primary-gold/10 scale-105 animate-pulse"
        />
      </div>
      <span className="text-xs uppercase tracking-widest text-zinc-400 font-semibold animate-pulse">
        Bujji Cellulars
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-pure-black">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
export default Loader;
