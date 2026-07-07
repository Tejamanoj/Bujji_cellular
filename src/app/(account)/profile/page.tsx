'use client';

import React, { useState, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { uploadService } from '@/services/upload';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { User as UserIcon, Camera, Plus, Trash2, Award, ShieldCheck, MapPin, CreditCard } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfileImage } = useAuthStore();
  const { addresses, cards, removeAddress, removeCard, syncUserData } = useUserStore();
  const { showToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (user?.id) {
      const unsub = syncUserData(user.id);
      return () => unsub();
    }
  }, [user?.id]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Corporate profile details updated successfully.', 'success');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    showToast('Uploading profile image...', 'info');

    try {
      const url = await uploadService.uploadImage(file);
      updateProfileImage(url);
      showToast('Profile photo updated successfully!', 'success');
    } catch {
      showToast('Image upload failed. Try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Account</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Your Profile</h1>
        <p className="text-sm text-zinc-500 mt-2">Manage your credentials, delivery destinations, and gold point balances.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Avatar & Profile stats */}
        <div className="lg:col-span-1 space-y-6">
          <div className="ultra-glass rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center text-center space-y-4">
            {/* Avatar container */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full overflow-hidden border border-primary-gold/40 bg-zinc-900 flex items-center justify-center relative">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={32} className="text-zinc-600" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-primary-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-900 border border-white/10 text-primary-gold hover:text-white transition-colors group-hover:scale-105">
                <Camera size={14} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            {/* Profile tags */}
            <div>
              <h3 className="font-display font-bold text-sm text-zinc-200">{user?.name}</h3>
              <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{user?.email}</p>
            </div>

            {/* Gold balance indicator */}
            <div className="w-full ultra-glass p-4 rounded-xl border border-primary-gold/15 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-primary-gold">
                <Award size={18} />
                <span className="text-[10px] uppercase font-bold tracking-wider">Gold Points</span>
              </div>
              <span className="font-mono font-bold text-sm text-white">{user?.loyaltyPoints} PTS</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Credentials editing & Saved items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credentials card */}
          <div className="ultra-glass rounded-2xl border border-white/5 p-6 space-y-6">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center space-x-2">
              <ShieldCheck size={15} className="text-primary-gold" />
              <span>Identity Verification</span>
            </h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-gold px-7 py-3 text-xs font-bold uppercase tracking-wider">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Saved Addresses list */}
          <div className="ultra-glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center space-x-2">
              <MapPin size={15} className="text-primary-gold" />
              <span>Saved Addresses</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-4 rounded-xl border border-white/6 bg-white/2 flex justify-between items-start h-28 relative hover:border-primary-gold/20 transition-colors">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-primary-gold">{addr.name}</span>
                    <p className="text-[10px] text-zinc-400 mt-1">{addr.street}</p>
                    <p className="text-[10px] text-zinc-400">{addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (user?.id) {
                        removeAddress(user.id, addr.id);
                        showToast('Address removed.', 'warning');
                      }
                    }}
                    className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Cards Vault */}
          <div className="ultra-glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center space-x-2">
              <CreditCard size={15} className="text-primary-gold" />
              <span>Credit Cards Vault</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="p-4 rounded-xl border border-white/6 bg-white/2 flex justify-between items-start h-28 relative hover:border-primary-gold/20 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 font-mono">{card.cardType}</span>
                    <p className="text-xs font-mono font-bold text-white tracking-wider">{card.cardNumber}</p>
                    <p className="text-[9px] text-zinc-500">EXP: {card.expiry}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (user?.id) {
                        removeCard(user.id, card.id);
                        showToast('Card removed from vault.', 'warning');
                      }
                    }}
                    className="text-zinc-650 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
