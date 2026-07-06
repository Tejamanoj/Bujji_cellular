'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useUIStore } from '@/store/uiStore';
import { ArrowLeft, ShoppingBag, Eye, UploadCloud, Plus, X, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

const COLOR_NAME_HINTS: { [key: string]: string } = {
  gold: '#D4AF37', black: '#111111', white: '#F5F5F5', silver: '#C0C0C0',
  titanium: '#8A8D8F', gray: '#808080', grey: '#808080', blue: '#3B5998',
  navy: '#1B2A4A', purple: '#6C4A8C', green: '#2E5339', red: '#8C1C1C',
  rose: '#B76E79', pink: '#E8A0BF', bronze: '#8C5E2A', graphite: '#41424C',
};

function guessHexFromName(name: string): string {
  const lower = name.toLowerCase();
  const match = Object.keys(COLOR_NAME_HINTS).find((key) => lower.includes(key));
  return match ? COLOR_NAME_HINTS[match] : '#888888';
}

export default function AdminNewProductPage() {
  const router = useRouter();
  const { addProduct } = useAdminStore();
  const { showToast } = useUIStore();

  // Smart Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupMeta, setLookupMeta] = useState<{ confidence?: string; note?: string } | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(299);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('smartphones');
  const [brand, setBrand] = useState('Apple');
  const [stock, setStock] = useState(25);
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<string[]>(['#111111', '#F5F5F5']);
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [storage, setStorage] = useState<string[]>(['128GB', '256GB']);
  
  // Custom Specs state
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specs, setSpecs] = useState<{ [key: string]: string }>({
    Warranty: '1 Year Manufacturer Warranty'
  });

  const handleAddSpec = () => {
    if (specKey && specVal) {
      setSpecs({ ...specs, [specKey]: specVal });
      setSpecKey('');
      setSpecVal('');
    }
  };

  const handleRemoveSpec = (key: string) => {
    const updated = { ...specs };
    delete updated[key];
    setSpecs(updated);
  };

  const handleAddColor = (hex: string) => {
    if (hex && !colors.includes(hex)) {
      setColors([...colors, hex]);
    }
  };

  const handleRemoveColor = (hex: string) => {
    setColors(colors.filter((c) => c !== hex));
  };

  const handleLookup = async () => {
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setLookupMeta(null);
    try {
      const res = await fetch('/api/admin/product-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: lookupQuery }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setLookupError(data.error || 'Lookup failed. Try a more specific name.');
        return;
      }
      const r = data.result;
      if (r.name) setName(r.name);
      if (r.brand) setBrand(r.brand);
      if (r.description) setDescription(r.description);
      if (r.category) setCategory(r.category);
      if (r.specs && typeof r.specs === 'object') setSpecs(r.specs);
      if (r.imageUrl) setImageUrl(r.imageUrl);
      if (typeof r.suggestedPriceINR === 'number') setPrice(r.suggestedPriceINR);
      if (Array.isArray(r.suggestedColors)) {
        setSuggestedColors(r.suggestedColors);
        // Automatically add first few colors if available
        const mappedHexes = r.suggestedColors.map((col: string) => guessHexFromName(col));
        const uniqueHexes = Array.from(new Set(mappedHexes));
        if (uniqueHexes.length > 0) setColors(uniqueHexes);
      }
      setLookupMeta({ confidence: r.priceConfidence, note: r.sourceNote });
      showToast(`Autofilled specifications for: ${r.name || lookupQuery}!`, 'success');
    } catch {
      setLookupError('Network error during lookup. Try again.');
      showToast('Network lookup failed.', 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const finalImage = imageUrl || 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80';

    addProduct({
      name,
      price,
      originalPrice,
      description,
      category,
      brand,
      stock,
      images: [finalImage],
      colors,
      storage,
      specs,
      featured: true
    });

    router.push('/admin/products');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-amber-400 font-mono transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Catalog
        </Link>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100">
          Create Custom Listing
        </h1>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wide">
          Forge new luxury device records for the public store catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Smart Lookup Block */}
          <div className="border border-amber-500/20 bg-amber-500/[0.03] p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Lookup
            </h3>
            <p className="text-xs text-zinc-500">
              Type a product name or model — we&apos;ll search the web and auto-fill the title, description, specs, category, a clear front-and-back image, and suggested price. Stock and color options stay yours to set.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                placeholder="e.g. Redmi Note 9 Pro, iPhone 15 Pro, Samsung S24"
                className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-colors cursor-pointer"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {lookupLoading ? 'Searching...' : 'Auto-fill'}
              </button>
            </div>
            {lookupError && <p className="text-xs text-rose-400 font-mono">{lookupError}</p>}
            {lookupMeta && (
              <p className="text-xs text-zinc-500 font-mono">
                Price confidence: <span className="text-amber-400">{lookupMeta.confidence || 'n/a'}</span>
                {lookupMeta.note ? ` — ${lookupMeta.note}` : ''} · Please review before publishing.
              </p>
            )}
          </div>

          {/* General Specs Block */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2">
              General Properties
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Vivo Y17, iPhone 15 Pro"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Retail Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="299"
                  required
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">List Price / Original (₹)</label>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g. 399 (for sales)"
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans cursor-pointer"
                >
                  <option value="smartphones">Smartphones</option>
                  <option value="audio">Audio</option>
                  <option value="wearables">Wearables</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Stock Level *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="10"
                  required
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Product Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a descriptive brief details about this product..."
                rows={4}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans resize-none"
              />
            </div>
          </div>

          {/* Media & Options Block */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2">
              Visual Options & Specifications
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
              />
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Available Colors</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <div key={c} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full pl-1 pr-2 py-1">
                    <span className="w-5 h-5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                    <span className="text-[10px] font-mono text-zinc-400">{c}</span>
                    <button type="button" onClick={() => handleRemoveColor(c)} className="text-zinc-600 hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-9 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleAddColor(newColorHex)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Color
                </button>
              </div>
              {suggestedColors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Suggested from lookup (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedColors.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleAddColor(guessHexFromName(name))}
                        className="flex items-center gap-1.5 bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-amber-400/50 rounded-full pl-1 pr-2.5 py-1 text-[10px] text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: guessHexFromName(name) }} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Specs Table List */}
            <div className="space-y-3.5">
              <label className="text-xs text-zinc-400 font-mono block">Technical Specifications</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Display)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 6.8 inch)"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                >
                  Add
                </button>
              </div>

              {Object.keys(specs).length > 0 && (
                <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/20 border-b border-zinc-900/60 font-sans">
                      <div className="flex gap-2">
                        <span className="font-mono text-zinc-500 font-medium">{key}:</span>
                        <span className="text-zinc-300 font-medium">{val}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(key)}
                        className="text-zinc-600 hover:text-rose-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 text-xs font-bold text-black rounded-xl hover:shadow-lg transition-all cursor-pointer"
            >
              Forge Record
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="sticky top-28 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>Device Preview</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500">
              <Eye className="w-3 h-3 animate-pulse" /> Interactive
            </span>
          </div>

          <div className="border border-zinc-850 bg-gradient-to-br from-zinc-950 to-zinc-900/90 rounded-3xl p-5 shadow-2xl space-y-5 relative overflow-hidden group">
            {/* Ambient Background blur */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl" />
            
            {/* Card Media */}
            <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-900 border border-zinc-800/80 overflow-hidden flex items-center justify-center relative p-2">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600 font-mono text-[10px]">
                  <UploadCloud className="w-8 h-8" />
                  <span>Awaiting media link...</span>
                </div>
              )}

              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono tracking-widest text-amber-400 border border-yellow-500/25 uppercase">
                {category}
              </span>
            </div>

            {/* Content info */}
            <div className="space-y-3.5 font-sans">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  {brand || 'APPLE'} BRAND ARTIFACT
                </span>
                <h4 className="text-lg font-bold text-zinc-100 tracking-tight leading-snug truncate">
                  {name || 'Untethered Gold Artifact'}
                </h4>
              </div>

              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {originalPrice && (
                  <span className="text-xs text-zinc-600 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {description || 'Provide a compelling description inside the catalog editor panel on the left to see this card update.'}
              </p>

              {/* Mini specs list */}
              {Object.keys(specs).length > 0 && (
                <div className="pt-3 border-t border-zinc-900/80 grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {Object.entries(specs).slice(0, 4).map(([key, val]) => (
                    <div key={key} className="space-y-0.5">
                      <span className="text-zinc-500 uppercase block">{key}</span>
                      <span className="text-zinc-300 font-semibold truncate block">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
