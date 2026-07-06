'use client';

import React from 'react';
import { useProductStore } from '@/store/productStore';
import { Rating } from '../common/Rating';

export const FilterSidebar: React.FC = () => {
  const { filters, setFilters, resetFilters, categories } = useProductStore();

  const brands = ['Bujji', 'Apple', 'Samsung', 'Nothing'];

  const handleBrandChange = (brand: string) => {
    const activeBrands = [...filters.brands];
    if (activeBrands.includes(brand)) {
      setFilters({ brands: activeBrands.filter((b) => b !== brand) });
    } else {
      setFilters({ brands: [...activeBrands, brand] });
    }
  };

  return (
    <div className="ultra-glass p-5 rounded-2xl space-y-6 text-left border border-white/5 bg-black">
      <div className="flex justify-between items-center pb-4 border-b border-zinc-900">
        <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-[10px] text-primary-gold hover:text-white uppercase tracking-wider transition-colors font-bold cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Dynamic Categories List */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Category</h4>
        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setFilters({ category: 'all' })}
            className={`text-left text-xs py-1 px-2 rounded transition-colors cursor-pointer ${
              filters.category === 'all'
                ? 'bg-primary-gold/15 text-primary-gold font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters({ category: cat.slug })}
              className={`text-left text-xs py-1 px-2 rounded transition-colors cursor-pointer ${
                filters.category === cat.slug
                  ? 'bg-primary-gold/15 text-primary-gold font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              {cat.image} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Select */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Brands</h4>
        <div className="flex flex-col space-y-2">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center space-x-2.5 text-xs text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={() => handleBrandChange(brand)}
                className="rounded border-zinc-800 bg-zinc-950 text-primary-gold focus:ring-primary-gold h-3.5 w-3.5"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Price Ceiling</h4>
          <span className="text-[11px] text-primary-gold font-mono">₹{filters.priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="50"
          value={filters.priceRange[1]}
          onChange={(e) => setFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value)] })}
          className="w-full accent-primary-gold bg-zinc-900 h-1 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-zinc-550 font-mono font-semibold tracking-wider">
          <span>₹0</span>
          <span>₹2,000</span>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Min Rating</h4>
        <div className="flex flex-col space-y-2">
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              onClick={() => setFilters({ rating: stars })}
              className={`flex items-center space-x-2 py-1 px-2 rounded text-left transition-colors cursor-pointer ${
                filters.rating === stars
                  ? 'bg-primary-gold/15 text-primary-gold'
                  : 'hover:bg-zinc-900/40 text-zinc-400'
              }`}
            >
              <Rating value={stars} max={5} readonly size={12} />
              <span className="text-[10px]">& Up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
