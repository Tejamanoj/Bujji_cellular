'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useUIStore } from '@/store/uiStore';
import { fetchProductById } from '@/backend/products';
import { Product } from '@/types';
import { ArrowLeft, UploadCloud, Plus, X, Sparkles, Loader2, Save, Eye, Play } from 'lucide-react';
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

  const { updateProduct, products, syncData } = useAdminStore();
  const { showToast } = useUIStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProduct, setOriginalProduct] = useState<Product | null>(null);

  // Sync products on mount for related selectors
  useEffect(() => {
    const unsub = syncData();
    return () => unsub();
  }, [syncData]);

  // Smart Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [lookupMeta, setLookupMeta] = useState<{ confidence?: string; note?: string } | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<string[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mobile-phones');
  const [brand, setBrand] = useState('');
  const [stock, setStock] = useState(0);
  
  // Media uploads states
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Color variants states
  const [colors, setColors] = useState<string[]>([]);
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [storage, setStorage] = useState<string[]>([]);
  const [newStorage, setNewStorage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [flashSale, setFlashSale] = useState(false);

  // Highlights state
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');

  // Video state
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Associations states
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);

  // Specs state
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');
  const [specs, setSpecs] = useState<{ [key: string]: string }>({});

  // Load product data
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
      setImages(product.images ?? []);
      setColors(product.colors ?? []);
      setStorage(product.storage ?? []);
      setSpecs(product.specs ?? {});
      setFeatured(product.featured ?? false);
      setFlashSale(product.flashSale ?? false);
      
      setHighlights(product.highlights ?? []);
      setVideos(product.videos ?? []);
      setSelectedAccessories(product.accessoryIds ?? []);
      setSelectedRelated(product.relatedIds ?? []);

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

  const handleAddHighlight = () => {
    const h = newHighlight.trim();
    if (h && !highlights.includes(h)) {
      setHighlights([...highlights, h]);
      setNewHighlight('');
    }
  };
  const handleRemoveHighlight = (h: string) => {
    setHighlights(highlights.filter((item) => item !== h));
  };

  const handleAddVideo = () => {
    const v = newVideoUrl.trim();
    if (v && !videos.includes(v)) {
      setVideos([...videos, v]);
      setNewVideoUrl('');
    }
  };
  const handleRemoveVideo = (v: string) => {
    setVideos(videos.filter((item) => item !== v));
  };

  const handleToggleAccessory = (id: string) => {
    if (selectedAccessories.includes(id)) {
      setSelectedAccessories(selectedAccessories.filter((i) => i !== id));
    } else {
      setSelectedAccessories([...selectedAccessories, id]);
    }
  };

  const handleToggleRelated = (id: string) => {
    if (selectedRelated.includes(id)) {
      setSelectedRelated(selectedRelated.filter((i) => i !== id));
    } else {
      setSelectedRelated([...selectedRelated, id]);
    }
  };

  // Upload image handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setImages([...images, data.url]);
      showToast('Image uploaded to cloud!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddCustomImage = () => {
    const url = customImageUrl.trim();
    if (url && !images.includes(url)) {
      setImages([...images, url]);
      setCustomImageUrl('');
    }
  };

  const handleRemoveImage = (url: string) => {
    setImages(images.filter((img) => img !== url));
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
        setLookupError(data.error || 'Lookup failed.');
        return;
      }
      const r = data.result;
      if (r.name) setName(r.name);
      if (r.brand) setBrand(r.brand);
      if (r.description) setDescription(r.description);
      if (r.category) setCategory(r.category);
      if (r.specs && typeof r.specs === 'object') setSpecs(r.specs);
      
      if (r.imageUrl && !images.includes(r.imageUrl)) {
        setImages([...images, r.imageUrl]);
      }

      if (r.description && r.specs) {
        const generatedHighlights = [
          r.specs.Processor || r.specs.Engine || 'Performance Artifact',
          r.specs.Display || r.specs.Screen || 'High Resolution Display',
          r.specs.Battery || r.specs.Capacity || 'Long Endurance Power',
          r.specs.Camera || 'Professional Camera Setup'
        ].filter(h => h && h !== '...');
        setHighlights(generatedHighlights);
      }

      if (typeof r.suggestedPriceINR === 'number') setPrice(r.suggestedPriceINR);
      if (Array.isArray(r.suggestedColors)) {
        setSuggestedColors(r.suggestedColors);
        const hexes = r.suggestedColors.map((col: string) => guessHexFromName(col));
        const uniqueHexes = Array.from(new Set(hexes)) as string[];
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
    if (!name || !price || !description) {
      showToast('Name, price and description are required.', 'error');
      return;
    }

    setSaving(true);
    const finalImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'];

    const success = await updateProduct({
      ...originalProduct!,
      name,
      price,
      originalPrice,
      description,
      category,
      brand,
      stock,
      images: finalImages,
      colors,
      storage,
      specs,
      featured,
      flashSale,
      thumbnails: finalImages,
      highlights,
      videos,
      accessoryIds: selectedAccessories,
      relatedIds: selectedRelated,
    });

    setSaving(false);
    if (success) {
      showToast('Catalog record updated successfully.', 'success');
      router.push('/admin/products');
    } else {
      showToast('Failed to update product details.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-light-gold" />
        <span className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Loading model data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-light-gold font-mono transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Catalog
          </Link>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 uppercase">
            Edit Catalog Listing
          </h1>
          <p className="text-xs text-zinc-550 font-mono uppercase tracking-wide">
            Refining model database record: <span className="text-light-gold font-bold">{originalProduct?.id}</span>
          </p>
        </div>

        {/* Action Toggle controls */}
        <div className="flex gap-4 items-center bg-zinc-950 p-3 rounded-2xl border border-zinc-900">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-9 h-5 rounded-full transition-colors relative ${featured ? 'bg-light-gold' : 'bg-zinc-800'}`}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Editor Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Smart Lookup */}
          <div className="border border-primary-gold/20 bg-primary-gold/[0.03] p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Re-Lookup
            </h3>
            <p className="text-xs text-zinc-550">
              Re-fetch updated specs, imagery and pricing from the web — overwrites current form values.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLookup(); } }}
                placeholder="e.g. Samsung Galaxy S24 Ultra"
                className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500/40 font-sans"
              />
              <button
                type="button"
                onClick={handleLookup}
                disabled={lookupLoading}
                className="px-4 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-white flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                {lookupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {lookupLoading ? 'Searching...' : 'Re-fetch'}
              </button>
            </div>
            {lookupError && <p className="text-xs text-rose-400 font-mono">{lookupError}</p>}
            {lookupMeta && (
              <p className="text-xs text-zinc-550 font-mono">
                Price confidence: <span className="text-light-gold">{lookupMeta.confidence || 'n/a'}</span>
                {lookupMeta.note ? ` — ${lookupMeta.note}` : ''} · Review before saving.
              </p>
            )}
          </div>

          {/* General specs */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold border-b border-zinc-900 pb-2">
              General Properties
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Product Title *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40 font-mono"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40 cursor-pointer"
                >
                  <option value="mobile-phones">Mobile Phones</option>
                  <option value="tv">Smart Television</option>
                  <option value="fridge">Refrigerator</option>
                  <option value="washing-machines">Washing Machine</option>
                  <option value="inverters">Power Inverter</option>
                  <option value="laptops">Laptop</option>
                  <option value="phone-accessories">Mobile Accessories</option>
                  <option value="audio">Audio Systems</option>
                  <option value="wearables">Wearable Tech</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Brand</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Product Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-light-gold/40 resize-none"
              />
            </div>
          </div>

          {/* Media & Options */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold border-b border-zinc-900 pb-2">
              Visual Options & Image Storage
            </h3>

            {/* Cloud Image Uploader */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Product Images / Gallery</label>
              
              <div className="border border-dashed border-zinc-800 hover:border-light-gold/40 bg-zinc-900/20 rounded-2xl p-6 flex flex-col items-center justify-center relative cursor-pointer group transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-550 group-hover:text-light-gold transition-colors mb-2" />
                <span className="text-xs text-zinc-400">
                  {uploadingImage ? 'Uploading file to cloud storage...' : 'Drag & drop or click to upload local media'}
                </span>
                <span className="text-[9px] text-zinc-650 font-mono uppercase tracking-widest mt-1">Cloudinary/S3 Integration enabled</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomImage}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-200"
                >
                  Add URL
                </button>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-zinc-550 font-mono">Current Uploads ({images.length})</span>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center group overflow-hidden">
                        <img src={img} alt="upload" className="max-h-full max-w-full object-contain rounded-lg" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Available Accent Finishes</label>
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
                  <p className="text-[10px] uppercase tracking-wider text-zinc-550 font-mono">Suggested (click to add):</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedColors.map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleAddColor(guessHexFromName(name))}
                        className="flex items-center gap-1.5 bg-zinc-900/60 border border-dashed border-zinc-700 hover:border-light-gold/50 rounded-full pl-1 pr-2.5 py-1 text-[10px] text-zinc-400 hover:text-light-gold transition-colors cursor-pointer"
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: guessHexFromName(name) }} />
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Storage Variants */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Storage / Memory Configurations</label>
              <div className="flex flex-wrap gap-2">
                {storage.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300">
                    {s}
                    <button type="button" onClick={() => handleRemoveStorage(s)} className="text-zinc-650 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 256GB / 12GB RAM"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-105"
                />
                <button
                  type="button"
                  onClick={handleAddStorage}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-200"
                >
                  Add Config
                </button>
              </div>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Product Highlights (Bullet Points)</label>
              <div className="space-y-2">
                {highlights.map((h, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800 rounded-xl px-4 py-2 text-xs">
                    <span className="text-zinc-300">{h}</span>
                    <button type="button" onClick={() => handleRemoveHighlight(h)} className="text-zinc-600 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 120Hz Fluid Motion AMOLED Display"
                  value={newHighlight}
                  onChange={(e) => setNewHighlight(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100"
                />
                <button
                  type="button"
                  onClick={handleAddHighlight}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-200"
                >
                  Add Highlight
                </button>
              </div>
            </div>

            {/* Videos */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Embed Product Videos (YouTube/MP4 URLs)</label>
              <div className="space-y-2">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-zinc-450">
                    <span className="truncate flex items-center gap-1.5"><Play className="w-3 h-3 text-light-gold" /> {v}</span>
                    <button type="button" onClick={() => handleRemoveVideo(v)} className="text-zinc-650 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddVideo}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-mono text-zinc-200"
                >
                  Add Video
                </button>
              </div>
            </div>

            {/* Cross-Sell and Relations */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-light-gold">Cross-sell Relationships</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest font-bold font-mono">Compatible Accessories</label>
                  <div className="max-h-48 overflow-y-auto border border-zinc-900 bg-zinc-950 rounded-xl p-3 space-y-1.5">
                    {products.filter(p => p.category === 'phone-accessories' || p.category === 'audio').map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedAccessories.includes(p.id)}
                          onChange={() => handleToggleAccessory(p.id)}
                          className="rounded border-zinc-800 bg-zinc-900 text-light-gold focus:ring-0 focus:ring-offset-0"
                        />
                        {p.name}
                      </label>
                    ))}
                    {products.filter(p => p.category === 'phone-accessories' || p.category === 'audio').length === 0 && (
                      <span className="text-[10px] text-zinc-600 block italic">No accessories found.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-555 uppercase tracking-widest font-bold font-mono">Related Models</label>
                  <div className="max-h-48 overflow-y-auto border border-zinc-900 bg-zinc-950 rounded-xl p-3 space-y-1.5">
                    {products.filter(p => p.category === category && p.id !== productId).map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedRelated.includes(p.id)}
                          onChange={() => handleToggleRelated(p.id)}
                          className="rounded border-zinc-800 bg-zinc-900 text-light-gold focus:ring-0 focus:ring-offset-0"
                        />
                        {p.name}
                      </label>
                    ))}
                    {products.filter(p => p.category === category && p.id !== productId).length === 0 && (
                      <span className="text-[10px] text-zinc-600 block italic">No products found in same category.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Specs Table */}
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <label className="text-xs text-zinc-400 font-mono block">Technical Specifications Table</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Battery Life)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100"
                />
                <input
                  type="text"
                  placeholder='Value (e.g. 6.8" AMOLED)'
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200"
                >
                  Add Spec
                </button>
              </div>

              {Object.keys(specs).length > 0 && (
                <div className="border border-zinc-900 rounded-xl overflow-hidden text-xs">
                  {Object.entries(specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center px-4 py-2.5 bg-zinc-900/20 border-b border-zinc-900/60">
                      <div className="flex gap-2">
                        <span className="font-mono text-zinc-550">{key}:</span>
                        <span className="text-zinc-300">{val}</span>
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

          <div className="flex gap-3 justify-end">
            <Link
              href="/admin/products"
              className="px-5 py-2.5 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-br from-accent-gold to-light-gold text-xs font-bold text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Apply Update'}
            </button>
          </div>
        </form>

        {/* Live Preview Column */}
        <div className="sticky top-28 space-y-4">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
            <span>Device Preview</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-light-gold">
              <Eye className="w-3 h-3 animate-pulse" /> Live Card
            </span>
          </div>

          <div className="border border-zinc-855 bg-gradient-to-br from-zinc-950 to-zinc-900/90 rounded-3xl p-5 shadow-2xl space-y-5 relative overflow-hidden group text-left">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary-gold/5 rounded-full blur-3xl" />
            
            <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-900 border border-zinc-800/80 overflow-hidden flex items-center justify-center relative p-2">
              {images[0] ? (
                <img 
                  src={images[0]} 
                  alt="Preview" 
                  className="w-full h-full object-contain rounded-xl" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 font-mono text-[10px]">
                  <UploadCloud className="w-8 h-8" />
                  <span>Awaiting media link...</span>
                </div>
              )}
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-mono tracking-widest text-light-gold border border-primary-gold/25 uppercase">
                {category}
              </span>
            </div>

            <div className="space-y-3.5 font-sans">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
                  {brand || 'APPLE'} BRAND ARTIFACT
                </span>
                <h4 className="text-lg font-bold text-zinc-100 tracking-tight leading-snug truncate">
                  {name || 'Untethered Blue Artifact'}
                </h4>
              </div>

              <div className="flex items-baseline gap-2 font-mono">
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-gold to-light-gold">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                {originalPrice && (
                  <span className="text-xs text-zinc-600 line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                {description || 'Provide a compelling description inside the catalog editor panel.'}
              </p>

              {highlights.length > 0 && (
                <ul className="text-[10px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-900/80">
                  {highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="truncate">• {h}</li>
                  ))}
                </ul>
              )}

              {Object.keys(specs).length > 0 && highlights.length === 0 && (
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
