'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ArrowRight, ShieldCheck, Terminal, ShieldAlert, Fingerprint } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { showToast } = useUIStore();

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Admin states
  const [adminId, setAdminId] = useState('');
  const [adminPasskey, setAdminPasskey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `> ${msg}`]);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    const success = await login(email, password);
    if (success) {
      showToast('Successfully logged in!', 'success');
      if (email === 'admin@bujjicellulars.com' || email === 'admin@bujjicellular.com') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } else {
      showToast('Invalid email or password.', 'error');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !adminPasskey) return;
    
    setIsVerifying(true);
    setTerminalLogs([]);
    
    setTimeout(() => addLog('Initiating secure handshake...'), 500);
    setTimeout(() => addLog('Validating Administrator Identity...'), 1200);
    setTimeout(() => addLog('Decrypting Secure Passkey...'), 2000);
    
    setTimeout(async () => {
      // Connect to authStore for admin login authentication
      const success = await login(adminId, adminPasskey);
      if (success) {
        addLog('ACCESS GRANTED. Routing to Control Panel.');
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        const authError = useAuthStore.getState().error || 'Invalid security credentials.';
        addLog(`ACCESS DENIED. Error: ${authError}`);
        setIsVerifying(false);
        showToast(`Admin authorization failed: ${authError}`, 'error');
      }
    }, 3000);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-left relative">
      <div className={`relative overflow-hidden p-8 rounded-2xl space-y-6 transition-all duration-700 bg-black border ${
        isAdminMode ? 'border-amber-500/40 shadow-2xl shadow-yellow-500/5' : 'border-zinc-900'
      }`}>
        
        {isAdminMode && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20 animate-pulse" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full" />
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
          <form onSubmit={handleUserSubmit} className="space-y-4 relative z-10">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="gold" size="lg" className="w-full flex items-center justify-center space-x-2" isLoading={isLoading}>
              <span>Sign In</span>
              <ArrowRight size={14} />
            </Button>
          </form>
        ) : (
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
                  <p>Warning: Level 4 Security Clearance Required.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Admin Email</label>
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="admin@bujjicellulars.com"
                    className="w-full bg-black/50 border border-zinc-800 text-amber-500 px-4 py-3 rounded-lg focus:outline-none focus:border-amber-500 font-mono tracking-widest text-xs placeholder-zinc-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Security Passkey</label>
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
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-800 text-amber-500 font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all group overflow-hidden relative cursor-pointer"
                >
                  <div className="absolute inset-0 w-0 bg-amber-500/10 transition-all duration-500 group-hover:w-full" />
                  <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Initiate Security Access</span>
                </button>
              </form>
            )}
          </div>
        )}

        <div className="flex flex-col space-y-2 pt-2 border-t border-zinc-900 text-center text-xs text-zinc-500 relative z-10">
          {!isAdminMode && (
            <p>
              New customer?{' '}
              <Link href="/signup" className="text-primary-gold hover:text-light-gold font-bold">
                Register Credentials
              </Link>
            </p>
          )}
          
          {!isVerifying && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                className="text-[10px] uppercase tracking-widest font-mono font-bold text-zinc-600 hover:text-amber-500 transition-colors flex items-center gap-2 cursor-pointer"
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
    </div>
  );
}
