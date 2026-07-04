'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Loader } from '@/components/common/Loader';
import { Star, HelpCircle } from 'lucide-react';


function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';

  const { products, setFilters, getFilteredProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();

  useEffect(() => {
    setFilters({ search: query });
  }, [query]);

  const results = getFilteredProducts();

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Catalog Search</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Search Results</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Showing <span className="text-white font-bold">{results.length}</span> results for:{' '}
          <span className="text-primary-gold font-mono">"{query}"</span>
        </p>
      </div>

      {results.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center ultra-glass border border-white/5 rounded-2xl p-6">
          <HelpCircle size={40} className="text-zinc-700 animate-pulse" />
          <div>
            <p className="text-sm font-semibold text-zinc-300">No match found</p>
            <p className="text-xs text-zinc-500 mt-1">We couldn't locate any products that match your query.</p>
          </div>
          <button onClick={() => router.push('/products')} className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {results.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="group ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 flex flex-col justify-between h-full text-left cursor-pointer transition-all duration-300"
            >
              <div className="p-4">
                <div className="w-full h-44 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-2 py-1">
                    <Star size={9} className="fill-primary-gold text-primary-gold" />
                    <span className="text-[9px] text-white font-bold">{product.rating}</span>
                  </div>
                </div>
                <span className="text-[9px] text-primary-gold font-mono uppercase tracking-widest">{product.brand}</span>
                <h3 className="font-display font-bold text-sm text-zinc-200 group-hover:text-primary-gold truncate mt-1 leading-tight">
                  {product.name}
                </h3>
                <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
              </div>

              <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-2">
                <div>
                  <p className="text-sm font-black text-primary-gold">₹{product.price.toLocaleString('en-IN')}</p>
                  {product.originalPrice && (
                    <p className="text-[10px] text-zinc-600 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                  )}
                </div>
                <button
                  className="btn-gold px-4 py-2 text-[10px] font-bold uppercase tracking-wider"
                  onClick={(e) => {
                    e.stopPropagation();
                    addItem(product, 1, product.colors[0], product.storage[0]);
                    showToast(`${product.name} added to cart!`, 'success');
                  }}
                >
                  Acquire
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <SearchResultsContent />
    </Suspense>
  );
}
