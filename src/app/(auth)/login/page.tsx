'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Lock, ArrowRight, ShieldAlert, Terminal, Fingerprint, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useUIStore();
  
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');

  // Admin states
  const [adminId, setAdminId] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') return;

    // Simulate OTP trigger
    const success = await login(email);
    if (success) {
      showToast('A verification OTP has been routed to your email.', 'success');
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } else {
      showToast('Validation failed. Inspect your credentials.', 'error');
    }
  };

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `> ?{msg}`]);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !adminPasskey) return;
    
    setIsVerifying(true);
    setTerminalLogs([]);
    
    // Simulate complex intense verification
    setTimeout(() => addLog('Initiating secure handshake...'), 500);
    setTimeout(() => addLog('Validating Alpha-Numeric Identifier...'), 1200);
    setTimeout(() => addLog('Decrypting Hex-Passkey...'), 2000);
    setTimeout(() => addLog('Bypassing standard firewall protocols...'), 2800);
    
    setTimeout(() => {
      if (adminId === 'admin' && adminPasskey === 'admin') {
        addLog('ACCESS GRANTED. Routing to Control Panel.');
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        addLog('ACCESS DENIED. Invalid security credentials.');
        addLog('Terminating connection...');
        setIsVerifying(false);
        showToast('Admin authorization failed!', 'error');
      }
    }, 4000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left relative">
      <div className={`relative overflow-hidden p-8 rounded-2xl space-y-6 transition-all duration-700 ultra-glass border ${
        isAdminMode 
          ? 'border-amber-500/40 shadow-2xl shadow-yellow-500/5' 
          : 'border-white/5'
      }`}>
        
        {/* Admin Background Effects */}
        {isAdminMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20 animate-pulse" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full" />
            
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] z-0 pointer-events-none opacity-20" />
          </div>
        )}

        <div className="text-center space-y-2 relative z-10">
          <span className={`font-display font-black text-lg tracking-wider ${isAdminMode ? 'text-amber-500' : 'text-gold-gradient'}`}>
            BUJJI CELLULARS
          </span>
          <h1 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            {isAdminMode ? 'Restricted Access Protocol' : 'Secure Access Portal'}
          </h1>
        </div>

        {!isAdminMode ? (
          // USER LOGIN FORM
          <div className="animate-fade-in space-y-6 relative z-10">
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <Input
                label="Corporate Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@corporation.com"
              />

              <Button type="submit" variant="gold" size="lg" className="w-full flex items-center justify-center space-x-2" isLoading={isLoading}>
                <span>Request OTP Token</span>
                <ArrowRight size={14} />
              </Button>
            </form>

            <div className="flex flex-col space-y-2 pt-2 border-t border-zinc-900 text-center text-xs text-zinc-500">
              <p>
                New partner?{' '}
                <Link href="/signup" className="text-primary-gold hover:text-light-gold font-bold">
                  Establish Credentials
                </Link>
              </p>
              <p>
                <Link href="/forgot-password" className="hover:text-zinc-300">
                  Recover passcode credentials
                </Link>
              </p>
            </div>
          </div>
        ) : (
          // ADMIN LOGIN FORM
          <div className="animate-fade-in space-y-6 relative z-10">
            {isVerifying ? (
              <div className="space-y-4 font-mono">
                <div className="flex items-center gap-3 text-amber-500 mb-4 animate-pulse">
                  <Terminal className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">System Override engaged</span>
                </div>
                
                <div className="bg-black/60 border border-zinc-900 rounded-xl p-4 h-48 overflow-y-auto space-y-2 font-mono text-[10px] text-emerald-500 tracking-wide">
                  {terminalLogs.map((log, i) => (
                    <p key={i} className="animate-fade-in">{log}</p>
                  ))}
                  <div className="animate-pulse w-2 h-3 bg-emerald-500 mt-1 inline-block" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminSubmit} className="space-y-5">
                <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono uppercase tracking-wide">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <p>Warning: Level 4 Security Clearance Required. Intrusion attempts will be logged.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Authorization Identifier</label>
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Alpha-Numeric ID"
                    className="w-full bg-black/50 border border-zinc-800 text-amber-500 px-4 py-3 rounded-lg focus:outline-none focus:border-amber-500 font-mono tracking-widest text-xs placeholder-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Hex-Encrypted Passkey</label>
                  <input
                    type="password"
                    required
                    value={adminPasskey}
                    onChange={(e) => setAdminPasskey(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/50 border border-zinc-800 text-amber-500 px-4 py-3 rounded-lg focus:outline-none focus:border-amber-500 font-mono tracking-widest text-lg placeholder-zinc-700"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-amber-500 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 w-0 bg-amber-500/10 transition-all duration-500 group-hover:w-full" />
                  <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Initiate Biometric Override</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Toggle Mode Button */}
        {!isVerifying && (
          <div className="pt-4 flex justify-center relative z-10 border-t border-zinc-900/60 mt-4">
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className="text-[10px] uppercase tracking-widest font-mono font-bold text-zinc-600 hover:text-amber-500 transition-colors flex items-center gap-2"
            >
              {isAdminMode ? (
                <>Return to Standard Access</>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Are you an admin?
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
