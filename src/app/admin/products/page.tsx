'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { DataTable, Column } from '@/components/admin/DataTable';
import { Product } from '@/types';
import { Edit2, Trash2, Plus, AlertCircle, ShoppingBag, Eye, Pencil } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const { products, deleteProduct, bulkDeleteProducts } = useAdminStore();
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter products by category if selected
  const filteredProducts = products.filter(
    (p) => categoryFilter === 'all' || p.category === categoryFilter
  );

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Out of Stock
        </span>
      );
    }
    if (stock < 10) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-primary-gold/10 text-light-gold border border-primary-gold/20">
          <span className="w-1.5 h-1.5 rounded-full bg-light-gold animate-pulse" />
          {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {stock} in stock
      </span>
    );
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      accessor: (product) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/3 border border-white/8 p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <ShoppingBag className="w-6 h-6 text-zinc-650" />
            )}
          </div>
          <div className="space-y-0.5">
            <span className="font-semibold text-zinc-100 line-clamp-1">{product.name}</span>
            <span className="text-[10px] font-mono text-zinc-550 uppercase tracking-wider block">
              {product.brand} • {product.category}
            </span>
          </div>
        </div>
      ),
      sortKey: 'name',
    },
    {
      header: 'Price',
      accessor: (product) => (
        <div className="font-mono text-zinc-200">
          <span className="font-bold">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && (
            <span className="text-[10px] text-zinc-550 line-through ml-1.5 font-medium">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
      sortKey: 'price',
    },
    {
      header: 'Inventory',
      accessor: (product) => getStockStatus(product.stock),
      sortKey: 'stock',
    },
    {
      header: 'Rating',
      accessor: (product) => (
        <div className="font-mono text-zinc-300 font-semibold flex items-center gap-1.5">
          <span className="text-light-gold">★</span>
          {product.rating.toFixed(1)}
        </div>
      ),
      sortKey: 'rating',
    },
    {
      header: 'Actions',
      accessor: (product) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${product.id}`}
            target="_blank"
            className="p-2 rounded-xl bg-white/3 hover:bg-white/6 text-zinc-400 hover:text-zinc-200 border border-white/6 transition-colors"
            title="View Product Page"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-2 rounded-xl bg-primary-gold/10 hover:bg-primary-gold/20 text-light-gold border border-primary-gold/20 transition-colors"
            title="Edit Product"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${product.name}?`)) {
                deleteProduct(product.id);
              }
            }}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const categories = [
    'all',
    'mobile-phones',
    'tv',
    'fridge',
    'washing-machines',
    'inverters',
    'laptops',
    'phone-accessories',
    'audio',
    'wearables'
  ];

  const categoryFilterComponent = (
    <select
      value={categoryFilter}
      onChange={(e) => setCategoryFilter(e.target.value)}
      className="bg-white/3 border border-white/8 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-primary-gold/50 cursor-pointer transition-colors"
    >
      {categories.map((c) => (
        <option key={c} value={c} className="bg-zinc-950 font-sans">
          {c.toUpperCase()}
        </option>
      ))}
    </select>
  );

  const bulkActionsComponent = (selectedItems: Product[]) => (
    <button
      onClick={() => {
        const names = selectedItems.map((p) => p.name).join(', ');
        if (confirm(`Delete selected products: ${names}?`)) {
          bulkDeleteProducts(selectedItems.map((p) => p.id));
        }
      }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/20 text-xs font-semibold text-rose-400 hover:bg-rose-500/25 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete Selected ({selectedItems.length})
    </button>
  );

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-sans tracking-tight text-white uppercase">
            Catalog Manager
          </h1>
          <p className="text-xs text-zinc-550 font-mono uppercase tracking-wide mt-1">
            Manage your store inventory, stock levels, and pricing list.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-accent-gold to-light-gold text-xs font-bold text-white rounded-xl hover:shadow-lg hover:shadow-accent-gold/10 transition-all uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 text-white" />
          Add Product
        </Link>
      </div>

      {/* Stats/Alert summary if any low/out of stock items */}
      {products.some((p) => p.stock === 0) && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Critical: One or more products are sold out and require restock.
        </div>
      )}

      {/* Main Table */}
      <DataTable
        data={filteredProducts}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Search products..."
        filterComponent={categoryFilterComponent}
        bulkActions={bulkActionsComponent}
        rowKey={(p) => p.id}
        initialSort={{ key: 'name', direction: 'asc' }}
        pageSize={8}
      />
    </div>
  );
}
