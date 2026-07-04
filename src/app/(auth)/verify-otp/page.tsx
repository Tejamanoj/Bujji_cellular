'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ShieldCheck } from 'lucide-react';

const OtpFallback = () => (
  <div className="max-w-md mx-auto px-4 py-32 text-center">
    <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
  </div>
);

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';

  const { login } = useAuthStore();
  const { showToast } = useUIStore();
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;

    setVerifying(true);
    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Complete login session
    const success = await login(email, name);
    if (success) {
      showToast('Passcode verified. Welcome back to Bujji Cellulars!', 'success');
      router.push('/');
    } else {
      showToast('Invalid OTP passcode. Please try again.', 'error');
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left">
      <div className="ultra-glass rounded-2xl border border-white/5 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-gold/15 border border-primary-gold/30 rounded-full flex items-center justify-center mx-auto text-primary-gold animate-bounce">
            <ShieldCheck size={24} />
          </div>
          <h1 className="font-display font-black text-sm uppercase tracking-wider text-zinc-350 mt-2">Enter Verification Code</h1>
          <p className="text-[10px] text-zinc-500">
            A 6-digit numeric passcode was dispatched to: <br />
            <span className="text-zinc-400 font-mono">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification Passcode"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="••••••"
            className="text-center font-mono tracking-widest text-lg animate-pulse"
          />

          <button type="submit" className="btn-gold w-full py-3.5 text-xs font-bold uppercase tracking-wider">
            Verify & Authenticate
          </button>
        </form>

        <div className="text-center text-[10px] text-zinc-500 pt-2 border-t border-white/5 uppercase tracking-widest">
          <button onClick={() => showToast('A new OTP token has been dispatched.', 'info')} className="hover:text-primary-gold font-bold">
            Resend Passcode
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<OtpFallback />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
