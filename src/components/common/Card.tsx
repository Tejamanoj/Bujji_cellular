'use client'

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-5 ${
        hoverable ? 'glass-card cursor-pointer' : 'glass-panel'
      } ${className}`}
    >
      {children}
    </div>
  );
};
export default Card;

