'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, isLoading } = useAuthStore();
  const { showToast } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const success = await signup(name, email, password);
    if (success) {
      showToast('Registration successful! Welcome.', 'success');
      router.push('/');
    } else {
      showToast('Registration failed. Email might already be registered.', 'error');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const success = await loginWithGoogle();
    setGoogleLoading(false);
    if (success) {
      showToast('Signed in with Google!', 'success');
      router.push('/');
    } else {
      const err = useAuthStore.getState().error;
      if (err && err !== 'Sign-in was cancelled.') {
        showToast(err, 'error');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-left">
      <div className="bg-black rounded-2xl border border-zinc-900 p-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="font-display font-black text-lg tracking-wider text-white">
            BUJJI <span className="text-primary-gold">CELLULARS</span>
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Establish Credentials</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Teja M" />
          <Input label="Email Address" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          <Input label="Password" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <button type="submit" disabled={isLoading} className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-wider cursor-pointer disabled:opacity-60">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Register Credentials</span><ArrowRight size={14} /></>}
          </button>
        </form>

        {/* OR Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-zinc-800 hover:border-zinc-600 text-zinc-200 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

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
