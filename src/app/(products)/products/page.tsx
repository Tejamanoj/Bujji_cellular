'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Grid, List, Star, Eye, ShoppingCart, Heart, Search, HelpCircle, X } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { FilterSidebar } from '@/components/products/FilterSidebar';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const router = useRouter();
  const { filters, setFilters, getFilteredProducts, quickViewProduct, setQuickViewProduct, fetchProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useUserStore();
  const { showToast } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  React.useEffect(() => {
    fetchProducts();
  }, []);
  
  // Quick View details modal quantities
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');

  const filteredProducts = getFilteredProducts();

  const handleOpenQuickView = (product: any) => {
    setQuickViewProduct(product);
    setSelectedColor(product.colors[0]);
    setSelectedStorage(product.storage[0]);
    setQty(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 border-b border-white/5 pb-8 text-left gap-4">
        <div>
          <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Bujji Cellulars</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Catalog</h1>
          <p className="text-sm text-zinc-500 mt-2">Custom-engineered luxury smartphones and gold-tier accessories.</p>
        </div>
        
        {/* Search / view options */}
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="bg-white/3 border border-white/8 px-4 py-1.5 pl-9 rounded-lg text-xs text-foreground focus:outline-none focus:border-primary-gold transition-colors"
            />
            <Search className="absolute left-3 top-2 text-zinc-500" size={12} />
          </div>

          {/* Sort By */}
          <select
            value={filters.sortBy}
            onChange={(e: any) => setFilters({ sortBy: e.target.value })}
            className="bg-white/3 border border-white/8 text-xs px-3 py-1.5 rounded-lg text-zinc-300 focus:outline-none focus:border-primary-gold transition-colors"
          >
            <option value="featured">Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {/* Grid/List Toggle */}
          <div className="hidden sm:flex border border-zinc-900 rounded-lg p-0.5 space-x-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-zinc-900 text-primary-gold' : 'text-zinc-500 hover:text-white'}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-zinc-900 text-primary-gold' : 'text-zinc-500 hover:text-white'}`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar />
        </div>

        {/* Right Column: Products Grid */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center ultra-glass border border-white/5 rounded-2xl p-6">
              <HelpCircle size={40} className="text-zinc-700" />
              <div>
                <p className="text-sm font-semibold text-zinc-300">No items match your filters</p>
                <p className="text-xs text-zinc-500 mt-1">Try broadening your parameters or search term.</p>
              </div>
              <button
                onClick={() => setFilters({ category: 'all', brands: [], rating: 0, search: '', priceRange: [0, 2000] })}
                className="btn-outline px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredProducts.map((product) => {
                const isWished = wishlist.includes(product.id);
                
                if (viewMode === 'grid') {
                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col justify-between h-full ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 relative text-left overflow-hidden transition-all duration-300"
                    >
                      {/* Image cover */}
                      <div>
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) {
                                showToast('Please log in to continue.', 'error');
                                router.push('/login');
                                return;
                              }
                              if (user?.id) {
                                toggleWishlist(user.id, product.id);
                                showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
                              }
                            }}
                            className="p-1.5 rounded-full bg-black/70 backdrop-blur border border-white/8 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Heart size={14} className={isWished ? 'fill-red-500 text-red-500' : ''} />
                          </button>
                        </div>
                        <div className="w-full h-44 bg-zinc-900 rounded-t-2xl overflow-hidden relative mb-4 flex items-center justify-center">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                            <button
                              onClick={() => handleOpenQuickView(product)}
                              className="p-2.5 rounded-full bg-zinc-950/80 backdrop-blur border border-white/8 text-zinc-300 hover:text-primary-gold hover:border-primary-gold transition-all cursor-pointer"
                              title="Quick View"
                            >
                              <Eye size={16} />
                            </button>
                            <Link href={`/products/${product.id}`}>
                              <button
                                className="p-2.5 rounded-full bg-zinc-950/80 backdrop-blur border border-white/8 text-zinc-300 hover:text-primary-gold hover:border-primary-gold transition-all cursor-pointer"
                                title="Inspect Details"
                              >
                                <ShoppingCart size={16} />
                              </button>
                            </Link>
                          </div>
                        </div>

                        {/* Text data */}
                        <div className="space-y-1 px-4">
                          <span className="text-[10px] text-primary-gold uppercase font-mono tracking-widest">{product.brand}</span>
                          <h3 className="font-display font-bold text-sm text-zinc-200 group-hover:text-primary-gold transition-colors line-clamp-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <Star size={10} className="fill-primary-gold text-primary-gold" />
                            <span className="text-[10px] text-zinc-400">{product.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between px-4 pb-4">
                        <div>
                          <span className="text-sm font-bold text-white">₹{product.price.toLocaleString('en-IN')}</span>
                          {product.originalPrice && (
                            <p className="text-[10px] text-zinc-600 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</p>
                          )}
                        </div>
                        <button
                          className="btn-gold px-4 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                          onClick={() => {
                            if (!isAuthenticated) {
                              showToast('Please log in to continue.', 'error');
                              router.push('/login');
                              return;
                            }
                            addItem(product, 1, product.colors[0], product.storage[0]);
                            showToast(`${product.name} added to cart!`, 'success');
                          }}
                        >
                          Acquire
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={product.id}
                      className="group ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 text-left flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 items-center p-4 relative transition-all duration-300"
                    >
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              showToast('Please log in to continue.', 'error');
                              router.push('/login');
                              return;
                            }
                            if (user?.id) {
                              toggleWishlist(user.id, product.id);
                              showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
                            }
                          }}
                          className="p-1.5 rounded-full bg-black/70 backdrop-blur border border-white/8 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Heart size={14} className={isWished ? 'fill-red-500 text-red-500' : ''} />
                        </button>
                      </div>

                      {/* Image cover */}
                      <div className="w-32 h-32 rounded-xl bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-2 min-w-0 pr-6">
                        <span className="text-[9px] text-primary-gold uppercase font-mono tracking-widest">{product.brand}</span>
                        <h3 className="font-display font-bold text-sm text-white group-hover:text-primary-gold transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-400 line-clamp-2">{product.description}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Star size={10} className="fill-primary-gold text-primary-gold" />
                            <span className="text-[10px] text-zinc-400">{product.rating}</span>
                          </div>
                          <span className="text-sm font-bold text-primary-gold">₹{product.price.toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div className="flex space-x-3 pt-2">
                          <Link href={`/products/${product.id}`}>
                            <button className="btn-outline px-5 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer">
                              Inspect Details
                            </button>
                          </Link>
                          <button
                            className="btn-gold px-5 py-2 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            onClick={() => {
                              if (!isAuthenticated) {
                                showToast('Please log in to continue.', 'error');
                                router.push('/login');
                                return;
                              }
                              addItem(product, 1, product.colors[0], product.storage[0]);
                              showToast(`${product.name} added to cart!`, 'success');
                            }}
                          >
                            Acquire
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        title={quickViewProduct?.name || ''}
      >
        {quickViewProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Gallery Image */}
            <div className="w-full h-64 rounded-xl bg-zinc-900 overflow-hidden flex items-center justify-center border border-zinc-800">
              <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
            </div>

            {/* Spec block */}
            <div className="space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-primary-gold">
                {quickViewProduct.category}
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">{quickViewProduct.description}</p>

              {/* Color selectors */}
              {quickViewProduct.colors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Color</span>
                  <div className="flex space-x-3">
                    {quickViewProduct.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-6 h-6 rounded-full border transition-all ${
                          selectedColor === color ? 'border-primary-gold scale-110 ring-1 ring-primary-gold' : 'border-zinc-800'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Storage options */}
              {quickViewProduct.storage.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Storage / Model</span>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.storage.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(storage)}
                        className={`px-3 py-1 text-xs border rounded-lg transition-all ${
                          selectedStorage === storage
                            ? 'border-primary-gold bg-primary-gold/10 text-primary-gold font-bold'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {storage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qty controls and checkout */}
              <div className="flex items-center space-x-4 pt-4 border-t border-zinc-900">
                <span className="font-bold text-lg text-primary-gold">?{quickViewProduct.price}</span>
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => {
                    addItem(quickViewProduct, qty, selectedColor, selectedStorage);
                    showToast(`${quickViewProduct.name} added to cart!`, 'success');
                    setQuickViewProduct(null);
                  }}
                >
                  Acquire & Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
