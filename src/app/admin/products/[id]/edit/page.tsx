'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useUIStore } from '@/store/uiStore';
import { fetchProductById } from '@/backend/products';
import { Product } from '@/types';
import { ArrowLeft, UploadCloud, Plus, X, Sparkles, Loader2, Save } from 'lucide-react';
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

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const { updateProduct, products } = useAdminStore();
  const { showToast } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

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
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<string[]>([]);
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [storage, setStorage] = useState<string[]>([]);
  const [newStorage, setNewStorage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [flashSale, setFlashSale] = useState(false);

  // Specs state
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specs, setSpecs] = useState<{ [key: string]: string }>({});

  // Load product data from store (fast path) or Firestore
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const cached = products.find((p) => p.id === productId);
      const product = cached ?? await fetchProductById(productId);

      if (!product) {
        showToast('Product not found.', 'error');
        router.push('/admin/products');
        return;
      }

      setOriginalProduct(product);
      setName(product.name);
      setPrice(product.price);
      setOriginalPrice(product.originalPrice);
      setDescription(product.description);
      setCategory(product.category);
      setBrand(product.brand);
      setStock(product.stock);
      setImageUrl(product.images[0] ?? '');
      setColors(product.colors ?? []);
      setStorage(product.storage ?? []);
      setSpecs(product.specs ?? {});
      setFeatured(product.featured ?? false);
      setFlashSale(product.flashSale ?? false);
      setLookupQuery(product.name);
      setLoading(false);
    };
    load();
  }, [productId]);

  const handleAddSpec = () => {
    if (specKey && specVal) {
      setSpecs({ ...specs, [specKey]: specVal });
      setSpecKey('');
      setSpecVal('');
    }
  };
  const handleRemoveSpec = (key: string) => {
    const u = { ...specs };
    delete u[key];
    setSpecs(u);
  };

  const handleAddColor = (hex: string) => {
    if (hex && !colors.includes(hex)) setColors([...colors, hex]);
  };
  const handleRemoveColor = (hex: string) => setColors(colors.filter((c) => c !== hex));

  const handleAddStorage = () => {
    const t = newStorage.trim();
    if (t && !storage.includes(t)) {
      setStorage([...storage, t]);
      setNewStorage('');
    }
  };
  const handleRemoveStorage = (opt: string) => setStorage(storage.filter((s) => s !== opt));

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
        setLookupError(data.error || 'Lookup failed.');
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
        const hexes = r.suggestedColors.map((col: string) => guessHexFromName(col));
        const uniqueHexes = Array.from(new Set(hexes));
        if (uniqueHexes.length > 0) setColors(uniqueHexes);
      }
      setLookupMeta({ confidence: r.priceConfidence, note: r.sourceNote });
      showToast(`Autofilled: ${r.name || lookupQuery}`, 'success');
    } catch {
      setLookupError('Network error. Try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description || !originalProduct) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
    setSaving(true);
    const updated: Product = {
      ...originalProduct,
      name,
      price,
      originalPrice,
      description,
      category,
      brand,
      stock,
      images: imageUrl ? [imageUrl] : originalProduct.images,
      colors,
      storage,
      specs,
      featured,
      flashSale,
    };
    const success = await updateProduct(updated);
    setSaving(false);
    if (success) {
      showToast('Product updated successfully!', 'success');
      router.push('/admin/products');
    } else {
      showToast('Update failed. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Loading product record...
          </p>
        </div>
      </div>
    );
  }

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

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black font-sans tracking-tight text-white uppercase">
              Edit Product
            </h1>
            <p className="text-xs text-zinc-500 font-mono mt-1 uppercase tracking-wider">
              Modifying record:{' '}
              <span className="text-amber-400 font-bold">{productId}</span>
            </p>
          </div>

          {/* Feature toggles */}
          <div className="flex items-center gap-5 flex-shrink-0 pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-9 h-5 rounded-full transition-colors relative ${featured ? 'bg-amber-500' : 'bg-zinc-800'}`}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="sr-only"
                />
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${featured ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">Featured</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-9 h-5 rounded-full transition-colors relative ${flashSale ? 'bg-rose-500' : 'bg-zinc-800'}`}>
                <input
                  type="checkbox"
                  checked={flashSale}
                  onChange={(e) => setFlashSale(e.target.checked)}
                  className="sr-only"
                />
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${flashSale ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-mono text-zinc-400 group-hover:text-zinc-200 transition-colors">Flash Sale</span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Left: Editor Form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* Smart Lookup */}
          <div className="border border-amber-500/20 bg-amber-500/[0.03] p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Re-Lookup
            </h3>
            <p className="text-xs text-zinc-500">
              Re-fetch updated specs, imagery and pricing from the web — overwrites current form values.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                placeholder="e.g. Samsung Galaxy S24 Ultra"
                className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-sans"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {lookupLoading ? 'Searching...' : 'Re-fetch'}
              </button>
            </div>
            {lookupError && <p className="text-xs text-rose-400 font-mono">{lookupError}</p>}
            {lookupMeta && (
              <p className="text-xs text-zinc-500 font-mono">
                Price confidence: <span className="text-amber-400">{lookupMeta.confidence || 'n/a'}</span>
                {lookupMeta.note ? ` — ${lookupMeta.note}` : ''} · Review before saving.
              </p>
            )}
          </div>

          {/* General Properties */}
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
                  required
                  min="1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">List / Original Price (₹)</label>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Leave blank if no discount"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 cursor-pointer"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Stock Level *</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
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
                rows={4}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-400/40 resize-none"
              />
            </div>
          </div>

          {/* Visual Options & Specs */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2">
              Visual Options & Specifications
            </h3>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Primary Image URL</label>
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
                    <span className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0" style={{ backgroundColor: c }} />
                    <span className="text-[10px] font-mono text-zinc-400">{c}</span>
                    <button type="button" onClick={() => handleRemoveColor(c)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {colors.length === 0 && (
                  <span className="text-xs text-zinc-600 font-mono">No colors added yet.</span>
                )}
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
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Color
                </button>
              </div>
              {suggestedColors.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Suggested (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedColors.map((cn) => (
                      <button
                        key={cn}
                        type="button"
                        onClick={() => handleAddColor(guessHexFromName(cn))}
                        className="flex items-center gap-1.5 bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-amber-400/50 rounded-full pl-1 pr-2.5 py-1 text-[10px] text-zinc-400 hover:text-amber-300 transition-colors cursor-pointer"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: guessHexFromName(cn) }} />
                        {cn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Storage Options */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Storage Options</label>
              <div className="flex flex-wrap gap-2">
                {storage.map((opt) => (
                  <div key={opt} className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
                    <span className="text-[11px] font-mono text-zinc-300">{opt}</span>
                    <button type="button" onClick={() => handleRemoveStorage(opt)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {storage.length === 0 && (
                  <span className="text-xs text-zinc-600 font-mono">No storage options added.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 128GB, 256GB, 1TB"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStorage(); } }}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400/40"
                />
                <button
                  type="button"
                  onClick={handleAddStorage}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-3.5">
              <label className="text-xs text-zinc-400 font-mono block">Technical Specifications</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Display)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400/40"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 6.8\" AMOLED)"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpec(); } }}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-400/40"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
              {Object.keys(specs).length > 0 && (
                <div className="border border-zinc-900 rounded-xl overflow-hidden">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/20 border-b border-zinc-900/60 last:border-b-0">
                      <div className="flex gap-3 text-xs">
                        <span className="font-mono text-zinc-500 font-medium">{key}:</span>
                        <span className="text-zinc-300">{val}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveSpec(key)} className="text-zinc-600 hover:text-rose-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-2">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-br from-amber-400 to-yellow-500 text-xs font-bold text-black rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* ── Right: Live Preview ── */}
        <div className="sticky top-28 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>Live Preview</span>
            <span className="text-[10px] text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Reactive
            </span>
          </div>

          <div className="border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900/90 rounded-3xl p-5 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Image */}
            <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-900 border border-zinc-800/80 overflow-hidden flex items-center justify-center relative p-2">
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-600 font-mono text-[10px]">
                  <UploadCloud className="w-8 h-8" />
                  <span>No image URL provided</span>
                </div>
              )}
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono tracking-widest text-amber-400 border border-yellow-500/25 uppercase">
                {category}
              </span>
              {flashSale && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-rose-500/90 text-[9px] font-mono font-bold tracking-widest text-white uppercase">
                  Flash Sale
                </span>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                  {brand || 'BRAND'}
                </span>
                <h4 className="text-lg font-bold text-zinc-100 tracking-tight leading-snug truncate mt-0.5">
                  {name || 'Product Name'}
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
                {description || 'Description will appear here...'}
              </p>

              {/* Stock + badges */}
              <div className="flex items-center flex-wrap gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                  stock === 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : stock < 10 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${stock === 0 ? 'bg-rose-500' : stock < 10 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {stock === 0 ? 'Out of Stock' : `${stock} in stock`}
                </span>
                {featured && (
                  <span className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    ★ Featured
                  </span>
                )}
              </div>

              {/* Colors preview */}
              {colors.length > 0 && (
                <div className="flex items-center gap-1.5 pt-1">
                  {colors.slice(0, 8).map((c) => (
                    <span key={c} className="w-5 h-5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                  {colors.length > 8 && (
                    <span className="text-[10px] font-mono text-zinc-500">+{colors.length - 8}</span>
                  )}
                </div>
              )}

              {/* Mini specs */}
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
