'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
      <div className="w-16 h-16 bg-primary-gold/15 border border-primary-gold/30 rounded-full flex items-center justify-center mx-auto text-primary-gold animate-pulse">
        <ShieldCheck size={32} />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-display font-black text-xl text-white uppercase tracking-wider">Payment Verification</h1>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Payments are secured and processed using advanced cryptographic escrow channels inside our checkouts.
        </p>
      </div>

      <Button variant="gold" className="w-full flex items-center justify-center space-x-2" onClick={() => router.push('/checkout')}>
        <ArrowLeft size={14} />
        <span>Return to Checkout</span>
      </Button>
    </div>
  );
}
