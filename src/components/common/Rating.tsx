'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  value: number;
  onChange?: (val: number) => void;
  max?: number;
  size?: number;
  readonly?: boolean;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  onChange,
  max = 5,
  size = 16,
  readonly = true,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (idx: number) => {
    if (readonly || !onChange) return;
    onChange(idx);
  };

  const handleMouseEnter = (idx: number) => {
    if (readonly) return;
    setHoverValue(idx);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(null);
  };

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starIdx = idx + 1;
        const filled = starIdx <= displayValue;

        const starIcon = (
          <Star
            size={size}
            className={`${
              filled
                ? 'fill-primary-gold text-primary-gold drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]'
                : 'text-zinc-700'
            }`}
          />
        );

        if (readonly) {
          return (
            <span key={idx} className="transition-colors duration-150 cursor-default">
              {starIcon}
            </span>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleClick(starIdx)}
            onMouseEnter={() => handleMouseEnter(starIdx)}
            onMouseLeave={handleMouseLeave}
            className="transition-colors duration-150 cursor-pointer hover:scale-110"
          >
            {starIcon}
          </button>
        );
      })}
    </div>
  );
};
export default Rating;
