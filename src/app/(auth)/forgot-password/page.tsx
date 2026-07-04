'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') return;

    await forgotPassword(email);
    showToast('Passcode reset recovery link dispatched.', 'success');
    setEmail('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left">
      <div className="ultra-glass rounded-2xl border border-white/5 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-display font-black text-lg tracking-wider text-white">
            BUJJI <span className="text-primary-gold">CELLULARS</span>
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Recover Credentials</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Corporate Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@corporation.com"
          />

          <button type="submit" className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-wider">
            Send Recovery Passcode
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 text-center text-xs text-zinc-500 flex items-center justify-center space-x-1.5 uppercase font-bold tracking-wider">
          <ArrowLeft size={10} className="text-zinc-500" />
          <Link href="/login" className="hover:text-zinc-300">
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
