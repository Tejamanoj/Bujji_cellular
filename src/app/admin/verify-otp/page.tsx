'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, KeyRound, Unlock } from 'lucide-react';
import Link from 'next/link';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { showToast } = useUIStore();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [cooldown, setCooldown] = useState(0); // Resend cooldown
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirection guard: if no email, send back to login
  useEffect(() => {
    if (!email) {
      router.push('/login');
    }
  }, [email, router]);

  // Expiration countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value.replace(/[^0-9]/g, '');
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (index < 5 && element.value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!otp[index] && index > 0) {
        // Focus previous input and clear it
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      showToast('Please enter all 6 digits.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        showToast('OTP verified successfully! Access granted.', 'success');
        
        // Complete session migration and reload page to establish middleware session
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
      } else {
        showToast(data.error || 'Invalid OTP code.', 'error');
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      showToast('Failed to connect to verification server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setResending(true);
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('A new OTP has been dispatched.', 'success');
        setTimeLeft(300); // reset expiration to 5 mins
        setCooldown(60); // 60 seconds cooldown
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        showToast(data.error || 'Failed to resend OTP.', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to authorization server.', 'error');
    } finally {
      setResending(false);
    }
  };

  // Trigger verify automatically when 6 digits are typed
  useEffect(() => {
    if (otp.join('').length === 6) {
      handleVerify();
    }
  }, [otp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left relative min-h-[80vh] flex flex-col justify-center">
      <div className="relative overflow-hidden p-8 rounded-2xl space-y-6 bg-black border border-primary-gold/40 shadow-2xl shadow-primary-gold/5">
        
        {/* Holographic scanner top border */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary-gold/20 animate-pulse" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-gold/10 blur-[80px] rounded-full" />
        </div>

        <div className="text-center space-y-2 relative z-10">
          <span className="font-display font-black text-lg tracking-wider text-light-gold">
            BUJJI CELLULARS
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Security Handshake Protocol
          </h1>
          <p className="text-[10px] text-zinc-650 font-mono uppercase tracking-wide">
            Level 4 Email MFA verification
          </p>
        </div>

        <div className="flex flex-col gap-2 p-4 bg-primary-gold/5 border border-primary-gold/20 rounded-xl text-zinc-300 text-xs font-mono uppercase tracking-wide text-center">
          <ShieldCheck className="w-6 h-6 text-light-gold mx-auto" />
          <p className="font-bold text-[10px] tracking-widest text-light-gold">OTP Code Dispatched</p>
          <p className="text-[9px] text-zinc-500 lowercase tracking-normal font-sans">
            A 6-digit access passkey has been sent to:<br />
            <span className="font-bold text-zinc-300 font-mono">{email}</span>
          </p>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Unlock className="w-8 h-8 animate-bounce" />
            </div>
            <p className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-widest">
              Access Granted
            </p>
            <p className="text-[9px] text-zinc-500">Redirecting to Control Panel...</p>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-mono text-zinc-500 font-bold">
                <span>Enter 6-Digit OTP</span>
                <span className={timeLeft < 60 ? 'text-rose-500 font-bold animate-pulse' : 'text-light-gold'}>
                  Expires: {formatTime(timeLeft)}
                </span>
              </div>
              
              <div className="flex justify-between gap-2.5">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={data}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading || timeLeft <= 0}
                    className="w-12 h-14 bg-black/60 border border-zinc-800 focus:border-light-gold focus:ring-1 focus:ring-light-gold/30 text-center text-light-gold font-mono text-xl font-bold rounded-xl focus:outline-none transition-all disabled:opacity-40"
                  />
                ))}
              </div>
            </div>

            {timeLeft <= 0 && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase tracking-wide text-center rounded-xl">
                The verification code has expired. Please request a new one.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || otp.join('').length < 6 || timeLeft <= 0}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-br from-accent-gold to-light-gold text-white font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-primary-gold/10 disabled:shadow-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>Authorize Access Session</span>
              </button>

              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-550 pt-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 hover:text-zinc-350 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || cooldown > 0}
                  className="flex items-center gap-1.5 hover:text-blue-400 transition-colors disabled:opacity-50 disabled:hover:text-zinc-550 cursor-pointer"
                >
                  {resending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>
                    {cooldown > 0 ? `Resend OTP in (${cooldown}s)` : 'Resend OTP Code'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default function AdminVerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-light-gold" />
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
