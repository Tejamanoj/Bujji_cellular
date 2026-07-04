'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { Star, ArrowLeft } from 'lucide-react';

export default function CategorySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const { showToast } = useUIStore();

  const [categoryName, setCategoryName] = useState('');
  const [catProducts, setCatProducts] = useState<any[]>([]);

  useEffect(() => {
    if (slug) {
      const items = products.filter((p) => p.category === slug);
      setCatProducts(items);

      const names: { [key: string]: string } = {
        smartphones: 'Smartphones',
        audio: 'AeroBuds & Audio',
        'power-chargers': 'Charging & Power',
        protection: 'Cyber Protection',
      };
      setCategoryName(names[slug] || 'Products');
    }
  }, [slug, products]);

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      {/* Header */}
      <div className="border-b border-white/5 pb-8 mb-10">
        <button
          onClick={() => router.push('/products')}
          className="flex items-center space-x-1.5 text-xs text-zinc-550 hover:text-primary-gold mb-2 transition-colors uppercase tracking-wider font-semibold"
        >
          <ArrowLeft size={12} />
          <span>All Catalog</span>
        </button>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">
          {categoryName}
        </h1>
      </div>

      {catProducts.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center ultra-glass border border-white/5 rounded-2xl p-6">
          <p className="text-sm font-semibold text-zinc-350">No products registered in this category</p>
          <button className="btn-gold mt-4 px-6 py-2.5 text-xs uppercase font-bold tracking-wider" onClick={() => router.push('/products')}>
            Return to catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {catProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => router.push(`/products/${product.id}`)}
              className="group ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 flex flex-col justify-between h-full cursor-pointer transition-all duration-300"
            >
              <div className="p-4">
                <div className="w-full h-40 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[9px] text-primary-gold font-mono uppercase tracking-widest">{product.brand}</span>
                <h3 className="font-display font-bold text-xs text-zinc-200 group-hover:text-primary-gold truncate mt-1">
                  {product.name}
                </h3>
                <div className="flex items-center space-x-1.5 mt-1">
                  <Star className="fill-primary-gold text-primary-gold" size={10} />
                  <span className="text-[10px] text-zinc-400">{product.rating}</span>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                <span className="text-xs font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
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
