'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/store/adminStore';
import { useUIStore } from '@/store/uiStore';
import { ArrowLeft, ShoppingBag, Eye, UploadCloud, Plus, X, Sparkles, Loader2, Play } from 'lucide-react';
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
  const { addProduct, products, syncData } = useAdminStore();
  const { showToast } = useUIStore();

  // Sync products on mount for selectors
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
  const [price, setPrice] = useState(29900);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('mobile-phones');
  const [brand, setBrand] = useState('Apple');
  const [stock, setStock] = useState(25);
  
  // Media uploads states
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Color variants states
  const [colors, setColors] = useState<string[]>(['#111111', '#F5F5F5']);
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [storage, setStorage] = useState<string[]>(['128GB', '256GB']);
  const [newStorage, setNewStorage] = useState('');
  
  // Custom Highlights states
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState('');
  
  // Product videos states
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Associations states
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedRelated, setSelectedRelated] = useState<string[]>([]);

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

  const handleAddStorage = () => {
    const s = newStorage.trim();
    if (s && !storage.includes(s)) {
      setStorage([...storage, s]);
      setNewStorage('');
    }
  };

  const handleRemoveStorage = (s: string) => {
    setStorage(storage.filter((item) => item !== s));
  };

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

  // Image upload handler
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
      showToast('Image uploaded successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Image upload failed', 'error');
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
        setLookupError(data.error || 'Lookup failed. Try a more specific name.');
        return;
      }
      const r = data.result;
      if (r.name) setName(r.name);
      if (r.brand) setBrand(r.brand);
      if (r.description) setDescription(r.description);
      if (r.category) setCategory(r.category);
      if (r.specs && typeof r.specs === 'object') setSpecs(r.specs);
      
      if (r.imageUrl) {
        setImages([r.imageUrl]);
      }

      // Populate highlights dynamically from descriptive attributes
      if (r.description && r.specs) {
        const generatedHighlights = [
          r.specs.Processor || r.specs.Engine || 'Premium Performance',
          r.specs.Display || r.specs.Screen || 'Stunning High-Resolution Display',
          r.specs.Battery || r.specs.Capacity || 'Long-lasting Battery Backup',
          r.specs.Camera || 'Advanced Camera System'
        ].filter(h => h && h !== '...');
        setHighlights(generatedHighlights);
      }

      if (typeof r.suggestedPriceINR === 'number') setPrice(r.suggestedPriceINR);
      if (Array.isArray(r.suggestedColors)) {
        setSuggestedColors(r.suggestedColors);
        const mappedHexes = r.suggestedColors.map((col: string) => guessHexFromName(col));
        const uniqueHexes = Array.from(new Set(mappedHexes)) as string[];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const finalImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'];

    const success = await addProduct({
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
      featured: true,
      flashSale: false,
      thumbnails: finalImages,
      highlights,
      videos,
      accessoryIds: selectedAccessories,
      relatedIds: selectedRelated,
    });

    if (success) {
      showToast('Product forged successfully!', 'success');
      router.push('/admin/products');
    } else {
      showToast('Failed to save product record.', 'error');
    }
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
        <p className="text-xs text-zinc-550 font-mono uppercase tracking-wide">
          Forge new luxury device records for the public store catalog.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Editor Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Smart Lookup */}
          <div className="border border-amber-500/20 bg-amber-500/[0.03] p-6 rounded-2xl space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Lookup
            </h3>
            <p className="text-xs text-zinc-500">
              Type a product name or model — we&apos;ll search the web and auto-fill details, dynamic specs, category, and clear renders.
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
                  placeholder="29900"
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
                  placeholder="e.g. 39900"
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
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2">
              Visual Options & Image Storage
            </h3>

            {/* Cloud Media Uploader */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Product Images / Gallery</label>
              
              {/* Drag-drop box */}
              <div className="border border-dashed border-zinc-800 hover:border-amber-400/40 bg-zinc-900/20 rounded-2xl p-6 flex flex-col items-center justify-center relative cursor-pointer group transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-550 group-hover:text-amber-400 transition-colors mb-2" />
                <span className="text-xs text-zinc-400">
                  {uploadingImage ? 'Uploading file to cloud storage...' : 'Drag & drop or click to upload local media'}
                </span>
                <span className="text-[9px] text-zinc-650 font-mono uppercase tracking-widest mt-1">Cloudinary/S3 Integration enabled</span>
              </div>

              {/* Paste URL option */}
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

              {/* Thumbnails preview strip */}
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
                  placeholder="e.g. 256GB, 12GB RAM / 512GB, 3-Star Double Door"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100"
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

            {/* Custom Highlights Section */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Product Key Highlights (Bullet Points)</label>
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
                  placeholder="e.g. Quad Camera with 50MP primary sensor"
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

            {/* Videos URLs */}
            <div className="space-y-3">
              <label className="text-xs text-zinc-400 font-mono block">Embed Product Videos (YouTube/MP4 URLs)</label>
              <div className="space-y-2">
                {videos.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900/30 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-zinc-450">
                    <span className="truncate flex items-center gap-1.5"><Play className="w-3 h-3 text-amber-500" /> {v}</span>
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

            {/* Associations Section */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500">Cross-sell Relationships</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Compatible Accessories Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold font-mono">Compatible Accessories</label>
                  <div className="max-h-48 overflow-y-auto border border-zinc-900 bg-zinc-950 rounded-xl p-3 space-y-1.5">
                    {products.filter(p => p.category === 'phone-accessories' || p.category === 'audio').map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedAccessories.includes(p.id)}
                          onChange={() => handleToggleAccessory(p.id)}
                          className="rounded border-zinc-800 bg-zinc-900 text-amber-400 focus:ring-0 focus:ring-offset-0"
                        />
                        {p.name}
                      </label>
                    ))}
                    {products.filter(p => p.category === 'phone-accessories' || p.category === 'audio').length === 0 && (
                      <span className="text-[10px] text-zinc-600 block italic">No accessories found in store database.</span>
                    )}
                  </div>
                </div>

                {/* Similar / Related Products Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-bold font-mono">Related Models</label>
                  <div className="max-h-48 overflow-y-auto border border-zinc-900 bg-zinc-950 rounded-xl p-3 space-y-1.5">
                    {products.filter(p => p.category === category).map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedRelated.includes(p.id)}
                          onChange={() => handleToggleRelated(p.id)}
                          className="rounded border-zinc-800 bg-zinc-900 text-amber-400 focus:ring-0 focus:ring-offset-0"
                        />
                        {p.name}
                      </label>
                    ))}
                    {products.filter(p => p.category === category).length === 0 && (
                      <span className="text-[10px] text-zinc-600 block italic">No products found in same category.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Specs Table List */}
            <div className="space-y-3.5 pt-4 border-t border-zinc-900">
              <label className="text-xs text-zinc-400 font-mono block">Technical Specifications Table</label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Display Tech)"
                  value={specKey}
                  onChange={(e) => setSpecKey(e.target.value)}
                  className="w-1/3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. AMOLED, 120Hz)"
                  value={specVal}
                  onChange={(e) => setSpecVal(e.target.value)}
                  className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                >
                  Add Spec
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
                        className="text-zinc-650 hover:text-rose-400"
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

              {/* Highlights List Preview */}
              {highlights.length > 0 && (
                <ul className="text-[10px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-900/80">
                  {highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="truncate">• {h}</li>
                  ))}
                </ul>
              )}

              {/* Mini specs list */}
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
