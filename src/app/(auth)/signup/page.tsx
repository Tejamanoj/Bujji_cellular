'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || email.trim() === '') return;

    const success = await signup(name, email);
    if (success) {
      showToast('Registration OTP sent. Please inspect your inbox.', 'success');
      router.push(`/verify-otp?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
    } else {
      showToast('Registration failed. Email might already have active credentials.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-left">
      <div className="ultra-glass rounded-2xl border border-white/5 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-display font-black text-lg tracking-wider text-white">
            BUJJI <span className="text-primary-gold">CELLULARS</span>
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Establish Credentials</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Teja M" />
          <Input label="Corporate Email Address" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />

          <button type="submit" className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wider">
            <span>Submit Registration</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 text-center text-xs text-zinc-500">
          <p>
            Already a partner?{' '}
            <Link href="/login" className="text-primary-gold hover:text-light-gold font-bold">
              Access Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
