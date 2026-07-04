'use client'

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const defaultId = React.useId();
  const inputId = id || defaultId;

  return (
    <div className={`flex flex-col space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-2.5 bg-zinc-950/80 border text-sm rounded-lg text-foreground focus:outline-none focus:ring-1 transition-all duration-200 ${
          error
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
            : 'border-zinc-800 focus:border-primary-gold focus:ring-primary-gold'
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-zinc-500">{helperText}</span>}
    </div>
  );
};
export default Input;

