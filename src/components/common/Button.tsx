'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Omit onAnimationStart to avoid conflict between React's AnimationEventHandler
// and Framer Motion's AnimationDefinition callback signature
type ButtonBaseProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart'
>;

interface ButtonProps extends ButtonBaseProps {
  variant?: 'gold' | 'outline' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gold',
  size = 'md',
  children,
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const variantStyles = {
    gold: 'bg-gradient-to-r from-[#111184] to-[#0a0a54] text-white shadow-[0_4px_15px_rgba(17,17,132,0.25)] hover:shadow-[0_6px_20px_rgba(17,17,132,0.4)]',
    outline:
      'border border-[#111184] text-[#111184] bg-transparent hover:bg-[rgba(17,17,132,0.1)] hover:shadow-[0_0_10px_rgba(17,17,132,0.15)]',
    glass:
      'glass-panel text-zinc-200 border-zinc-800 hover:border-[rgba(17,17,132,0.5)] hover:bg-zinc-900/80',
    ghost: 'text-zinc-400 hover:text-white hover:bg-zinc-900/50',
    danger:
      'bg-red-950/80 border border-red-800 text-red-200 hover:bg-red-900 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.025 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.975 }}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...(props as any)}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg
            className="animate-spin -ml-1 mr-3 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
