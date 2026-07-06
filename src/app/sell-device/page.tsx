'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Cpu } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export default function SellDevicePage() {
  const router = useRouter();
  const { showToast } = useUIStore();

  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('iPhone 13 Pro');
  const [condition, setCondition] = useState('Good');
  const [estimatedValue, setEstimatedValue] = useState(38500);

  // Recalculate estimated value based on choices
  const calculateValue = (selectedBrand: string, selectedModel: string, selectedCond: string) => {
    let base = 25000;
    if (selectedBrand === 'Apple') base = 30000;
    if (selectedModel.includes('15') || selectedModel.includes('S24')) base += 15000;
    else if (selectedModel.includes('14') || selectedModel.includes('S23')) base += 8000;

    if (selectedCond === 'Like New') base = Math.floor(base * 1.2);
    else if (selectedCond === 'Good') base = Math.floor(base * 1.0);
    else if (selectedCond === 'Fair') base = Math.floor(base * 0.8);

    setEstimatedValue(base);
  };

  const handleBrandChange = (val: string) => {
    setBrand(val);
    const defaultModel = val === 'Apple' ? 'iPhone 13 Pro' : 'Galaxy S23 Ultra';
    setModel(defaultModel);
    calculateValue(val, defaultModel, condition);
  };

  const handleModelChange = (val: string) => {
    setModel(val);
    calculateValue(brand, val, condition);
  };

  const handleConditionChange = (val: string) => {
    setCondition(val);
    calculateValue(brand, model, val);
  };

  const handleGetOffer = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Bespoke trade-in contract registered! Send your device for pickup.', 'success');
    router.push('/profile');
  };

  return (
    <div className="relative site-bg min-h-screen pb-24 text-left">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 h-16 bg-[#0a0a0a]/90 border-b border-[#2a2a2a] backdrop-blur-md px-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-full border border-[#2a2a2a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <span className="text-sm">←</span>
        </button>
        <span className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase">SELL / EXCHANGE</span>
        <div className="w-8 h-8" /> {/* Spacer */}
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-6">
        
        {/* Banner Section */}
        <div className="text-center space-y-2 py-4">
          <h2 className="text-2xl font-display font-black text-white uppercase tracking-wider">Give Your Old Device a New Life</h2>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Best value. Hassle free.</p>
        </div>

        {/* Device Preview */}
        <div className="relative w-full aspect-[4/3] rounded-3xl bg-[#1a1a1a] border border-[#2a2a2a] p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0%,transparent_75%)] pointer-events-none" />
          
          <div className="relative w-32 h-32 flex items-center justify-center z-10">
            <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Cpu size={40} />
            </div>
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/80 border border-white/5 flex items-center justify-center text-[10px] shadow-lg animate-bounce">
              ⌚
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-8 font-mono text-center uppercase tracking-widest">Select your device details →</p>
        </div>
            {/* Dropdowns Configuration */}
            <form onSubmit={handleGetOffer} className="space-y-4">
              {/* Brand select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Select Brand</label>
                <select
                  value={brand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="OnePlus">OnePlus</option>
                </select>
              </div>

              {/* Model select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Select Device</label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  {brand === 'Apple' ? (
                    <>
                      <option value="iPhone 13 Pro">iPhone 13 Pro</option>
                      <option value="iPhone 14 Pro">iPhone 14 Pro</option>
                      <option value="iPhone 15 Pro">iPhone 15 Pro</option>
                    </>
                  ) : (
                    <>
                      <option value="Galaxy S23 Ultra">Galaxy S23 Ultra</option>
                      <option value="Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                    </>
                  )}
                </select>
              </div>

              {/* Condition select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Device Condition</label>
                <select
                  value={condition}
                  onChange={(e) => handleConditionChange(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="Like New">Like New (Flawless)</option>
                  <option value="Good">Good (Minor Scratches)</option>
                  <option value="Fair">Fair (Heavy Scratches/Dents)</option>
                </select>
              </div>

              {/* Estimated Value & Action */}
              <div className="pt-4 border-t border-[#2a2a2a] space-y-4">
                <div className="flex justify-between items-center text-left">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Estimated Value</span>
                    <span className="text-2xl font-black text-white font-mono">₹{estimatedValue.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="badge-violet text-[9px]">+12% better price</span>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full py-4 text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Get Instant Offer →
                </button>
              </div>
            </form>

      </main>
    </div>
  );
}
