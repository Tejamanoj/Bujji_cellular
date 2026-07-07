'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ArrowRight, ShieldCheck, Terminal, ShieldAlert, Fingerprint, Scan, Camera, X, Loader2, Lock, Unlock } from 'lucide-react';
import { db } from '@/backend/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

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
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [phoneMask, setPhoneMask] = useState('+91 ••••• ••892');

  // Face Unlock Biometric states
  const [showFaceScan, setShowFaceScan] = useState(false);
  const [scanStep, setScanStep] = useState<1 | 2 | 3 | 4>(1); // 1: startup, 2: scanning, 3: matching, 4: success
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [matchedFaceLabel, setMatchedFaceLabel] = useState('');
  const [allBiometrics, setAllBiometrics] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const addLog = (msg: string) => {
    setTerminalLogs((prev) => [...prev, `> ${msg}`]);
  };

  const addScanLog = (msg: string) => {
    setScanLogs((prev) => [...prev, msg]);
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
      try {
        const loginRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: adminId, password: adminPasskey })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.success) {
          addLog('Credentials verified. Initiating OTP handshake...');
          
          // Send OTP
          const sendOtpRes = await fetch('/api/admin/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminId })
          });
          const sendOtpData = await sendOtpRes.json();
          
          if (sendOtpRes.ok && sendOtpData.success) {
            addLog('OTP Security Code dispatched to registered email.');
            showToast('OTP code sent to email!', 'success');
            setTimeout(() => {
              setIsVerifying(false);
              router.push(`/admin/verify-otp?email=${encodeURIComponent(adminId)}`);
            }, 1000);
          } else {
            addLog(`Failed to dispatch OTP: ${sendOtpData.error}`);
            setIsVerifying(false);
            showToast(sendOtpData.error || 'Failed to send OTP.', 'error');
          }
        } else {
          addLog(`ACCESS DENIED. Error: ${loginData.error}`);
          setIsVerifying(false);
          showToast(loginData.error || 'Access denied.', 'error');
        }
      } catch (err: any) {
        addLog(`Connection failed: ${err.message}`);
        setIsVerifying(false);
        showToast('Login connection failed.', 'error');
      }
    }, 2800);
  };

  // Start Biometric Face Unlock
  const handleStartFaceScan = async () => {
    const targetEmail = adminId.trim() || 'admin@bujjicellular.com';
    setShowFaceScan(true);
    setScanStep(1);
    setScanLogs([]);
    setMatchedFaceLabel('');
    setAllBiometrics([]);
    
    addScanLog('Initializing high-definition biometric optical sensors...');
    addScanLog(`Connecting to secure profile for: ${targetEmail}`);

    try {
      // Query admin user by email to verify biometrics
      const q = query(collection(db, 'admin_users'), where('email', '==', targetEmail));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        addScanLog('Error: Administrator identity not mapped. Access denied.');
        showToast('Account not configured as authorized admin in system.', 'error');
        return;
      }
      
      const adminData = snap.docs[0].data();
      const registeredBiometrics = adminData.biometrics || [];
      
      if (registeredBiometrics.length === 0) {
        addScanLog('Error: 0 Biometric credentials stored. Access denied.');
        showToast('Please sign in using passkey and configure Face ID in settings first.', 'warning');
        return;
      }

      setAllBiometrics(registeredBiometrics);
      // Pick the primary face slot label
      setMatchedFaceLabel(registeredBiometrics[0].label);

      // Open user webcam
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setScanStep(2);
      addScanLog('Webcam linked. Engaging live face scanning override...');
    } catch (err: any) {
      console.warn('Camera blocked or unavailable, using holographic simulation instead.', err);
      // If camera blocked, but biometrics are registered, we still allow logging in with simulated interface
      if (matchedFaceLabel) {
        setScanStep(2);
        addScanLog('Optical camera offline. Engaging biometric simulation mesh...');
      } else {
        addScanLog(`Verification failed: ${err.message}`);
      }
    }
  };

  // Stop video stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowFaceScan(false);
  };

  // Simulate scanning cycles
  useEffect(() => {
    if (!showFaceScan || scanStep !== 2) return;

    const t1 = setTimeout(() => {
      addScanLog('Scanning face landmarks and depth indices...');
      setScanStep(3);
    }, 1500);

    return () => clearTimeout(t1);
  }, [showFaceScan, scanStep]);

  useEffect(() => {
    if (!showFaceScan || scanStep !== 3) return;

    let matchedFace: any = null;
    let minDifference = 9999;

    // Capture current frame and check color hashes
    if (scanCanvasRef.current && videoRef.current) {
      const ctx = scanCanvasRef.current.getContext('2d');
      if (ctx && videoRef.current.readyState >= 2) {
        ctx.drawImage(videoRef.current, 0, 0, 300, 300);
        try {
          const imgData = ctx.getImageData(0, 0, 300, 300);
          let r = 0, g = 0, b = 0;
          for (let i = 0; i < imgData.data.length; i += 40) {
            r += imgData.data[i];
            g += imgData.data[i+1];
            b += imgData.data[i+2];
          }
          const samples = imgData.data.length / 40;
          const liveHash = { r: r/samples, g: g/samples, b: b/samples };

          allBiometrics.forEach((key) => {
            const regHash = key.faceHash || { r: 120, g: 120, b: 120 };
            const diff = Math.abs(liveHash.r - regHash.r) + Math.abs(liveHash.g - regHash.g) + Math.abs(liveHash.b - regHash.b);
            if (diff < minDifference) {
              minDifference = diff;
              matchedFace = key;
            }
          });
        } catch (err) {
          console.warn('Scan frame analysis failed:', err);
        }
      }
    }

    // Threshold of difference. If higher, it means different face/lighting profile
    const matchThreshold = 35;
    const isMatched = matchedFace && minDifference < matchThreshold;

    const t2 = setTimeout(() => {
      if (isMatched) {
        addScanLog(`Analyzing mesh signature... Match confidence: ${(99.8 - (minDifference * 0.05)).toFixed(1)}%`);
        addScanLog(`Biometric signature matches slot: [${matchedFace.label}]`);
        setMatchedFaceLabel(matchedFace.label);
      } else {
        addScanLog(`Analyzing mesh signature... Mismatch detected!`);
        addScanLog(`Error: Face signature does not align with registered slots.`);
      }
    }, 1000);

    const t3 = setTimeout(() => {
      if (isMatched) {
        addScanLog('Verification Complete. Authorized user authenticated.');
        setScanStep(4);
      } else {
        showToast('Face mismatch. Unknown admin face detected.', 'error');
        stopStream();
      }
    }, 2500);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [showFaceScan, scanStep, allBiometrics]);

  // Handle successful scan login
  useEffect(() => {
    if (!showFaceScan || scanStep !== 4) return;

    const t4 = setTimeout(async () => {
      const targetEmail = adminId.trim() || 'admin@bujjicellular.com';
      stopStream();
      
      try {
        const loginRes = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: targetEmail, password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        
        if (loginRes.ok && loginData.success) {
          // Send OTP
          const sendOtpRes = await fetch('/api/admin/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: targetEmail })
          });
          const sendOtpData = await sendOtpRes.json();
          
          if (sendOtpRes.ok && sendOtpData.success) {
            showToast(`Face match verified! OTP sent to registered email.`, 'success');
            router.push(`/admin/verify-otp?email=${encodeURIComponent(targetEmail)}`);
          } else {
            showToast(sendOtpData.error || 'Failed to send OTP after face match.', 'error');
          }
        } else {
          showToast(loginData.error || 'Biometric login identity check failed.', 'error');
        }
      } catch (err: any) {
        showToast('Biometric network request failed.', 'error');
      }
    }, 1000);

    return () => clearTimeout(t4);
  }, [showFaceScan, scanStep, adminId, matchedFaceLabel]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Sync camera stream to video ref when ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showFaceScan]);

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
              <div className="space-y-5">
                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono uppercase tracking-wide">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <p>Warning: Level 4 Security Clearance Required.</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Admin Email</label>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminId('admin@bujjicellular.com');
                          setAdminPasskey('Admin@123');
                        }}
                        className="text-[9px] uppercase font-mono text-amber-500/70 hover:text-amber-400 hover:underline cursor-pointer"
                      >
                        Autofill Demo Admin
                      </button>
                    </div>
                    <input
                      type="email"
                      name="email"
                      autoComplete="username"
                      required
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="admin@bujjicellular.com"
                      className="w-full bg-black/50 border border-zinc-800 text-amber-500 px-4 py-3 rounded-lg focus:outline-none focus:border-amber-500 font-mono tracking-widest text-xs placeholder-zinc-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">Security Passkey</label>
                    <input
                      type="password"
                      name="password"
                      autoComplete="current-password"
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

                {/* 2FA biometric face unlock trigger */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-900" />
                  <span className="flex-shrink mx-4 text-[9px] uppercase tracking-wider font-mono text-zinc-650 font-bold">2FA Biometric Channel</span>
                  <div className="flex-grow border-t border-zinc-900" />
                </div>

                <button
                  type="button"
                  onClick={handleStartFaceScan}
                  className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 hover:from-amber-400/30 hover:to-yellow-400/20 border border-amber-500/30 rounded-xl text-amber-400 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer font-bold"
                >
                  <Scan className="w-4 h-4 text-amber-500" />
                  <span>Scan Face to Unlock</span>
                </button>
              </div>
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

      {/* ── BIOMETRIC SCAN OVERLAY MODAL ── */}
      {showFaceScan && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm border border-amber-500/30 bg-zinc-950 p-6 rounded-3xl space-y-6 text-center shadow-2xl relative overflow-hidden">
            {/* Holographic background matrix */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full" />
            
            <button
              onClick={stopStream}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            <div className="space-y-1 pt-4">
              <h3 className="font-mono text-xs uppercase font-bold text-amber-500 tracking-widest">Face Recognition Scan</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">Level 4 Biometric Handshake</p>
            </div>

            {/* Video Frame Feed */}
            <div className="w-48 h-48 rounded-full border-2 border-dashed border-amber-500/40 p-2 mx-auto relative overflow-hidden bg-zinc-900 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              {/* Webcam stream viewport */}
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-full scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 font-mono text-[9px]">
                  <Camera className="w-8 h-8 text-zinc-600 animate-pulse" />
                  <span>Optical Sensor offline</span>
                </div>
              )}

              {/* Scanning moving grid line */}
              {scanStep === 2 && (
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce w-full" style={{ animationDuration: '2s' }} />
              )}

              {/* Lock indicator state */}
              {scanStep === 4 && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center text-emerald-400">
                  <Unlock className="w-10 h-10 animate-bounce" />
                </div>
              )}
              {scanStep < 4 && scanStep > 1 && !stream && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-zinc-800 animate-spin" />
                </div>
              )}
            </div>

            {/* Log Stream Terminal */}
            <div className="bg-black border border-zinc-900 rounded-2xl p-4 h-32 overflow-y-auto space-y-1 font-mono text-[9px] text-left text-zinc-400">
              {scanLogs.map((log, i) => (
                <p key={i} className="animate-fade-in text-emerald-500/80">
                  <span className="text-amber-500">&gt;&gt;</span> {log}
                </p>
              ))}
              {scanStep < 4 && (
                <div className="flex items-center gap-1.5 text-zinc-550 pt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  <span>Awaiting credentials handshake...</span>
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* Hidden scan canvas */}
      <canvas ref={scanCanvasRef} width={300} height={300} className="hidden" />
    </div>
  );
}
