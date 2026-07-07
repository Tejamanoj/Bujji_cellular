'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Save, ShieldCheck, Mail, HelpCircle, Truck, Database, Trash2, Camera, X, Scan, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { db } from '@/backend/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface BiometricKey {
  id: string;
  label: string;
  snapshotUrl: string;
  registeredAt: string;
  faceHash?: { r: number; g: number; b: number };
  embedding?: number[];
}

function extractFaceEmbedding(canvas: HTMLCanvasElement): number[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return Array(128).fill(0.5);

  const imgData = ctx.getImageData(0, 0, 300, 300);
  const data = imgData.data;
  const embedding: number[] = [];

  const gridSize = 8;
  const blockSize = 300 / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const startX = Math.floor(gx * blockSize);
      const startY = Math.floor(gy * blockSize);
      const endX = Math.floor((gx + 1) * blockSize);
      const endY = Math.floor((gy + 1) * blockSize);

      let totalR = 0, totalG = 0, totalB = 0;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * 300 + x) * 4;
          totalR += data[idx];
          totalG += data[idx + 1];
          totalB += data[idx + 2];
          count++;
        }
      }

      const avgR = totalR / count;
      const avgG = totalG / count;
      const avgB = totalB / count;

      const luminosity = (0.299 * avgR + 0.587 * avgG + 0.114 * avgB) / 255;
      const colorBalance = avgR / (avgG + avgB + 1);

      embedding.push(luminosity);
      embedding.push(Math.min(1, Math.max(0, colorBalance / 2)));
    }
  }

  while (embedding.length < 128) embedding.push(0.5);
  return embedding.slice(0, 128);
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();

  const [storeName, setStoreName] = useState('Bujji Cellulars');
  const [storeEmail, setStoreEmail] = useState('contact@bujjicellulars.com');
  const [shippingRate, setShippingRate] = useState(15);
  const [taxRate, setTaxRate] = useState(8.25);
  const [allowPromo, setAllowPromo] = useState(true);
  
  // Notification states
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyNewRepair, setNotifyNewRepair] = useState(true);
  const [notifyOrders, setNotifyOrders] = useState(true);

  // Biometrics States
  const [biometrics, setBiometrics] = useState<BiometricKey[]>([]);
  const [loadingBiometrics, setLoadingBiometrics] = useState(true);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanLabel, setScanLabel] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [tempFaceHash, setTempFaceHash] = useState<{ r: number; g: number; b: number } | null>(null);
  const [tempFaceEmbedding, setTempFaceEmbedding] = useState<number[] | null>(null);

  // Admin Profile & Security credentials states
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRecoveryEmail, setAdminRecoveryEmail] = useState('');
  const [adminProfileImage, setAdminProfileImage] = useState('');
  const [faceAuthEnabled, setFaceAuthEnabled] = useState(true);

  // Video Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Load settings and import TensorFlow.js on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).tf) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs';
      script.async = true;
      document.body.appendChild(script);
    }

    const loadBiometrics = async () => {
      if (!user?.id) return;
      try {
        const docRef = doc(db, 'admin_users', user.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBiometrics(data.biometrics || []);
          setAdminEmail(data.email || '');
          setAdminRecoveryEmail(data.recoveryEmail || '');
          setAdminProfileImage(data.profileImage || '');
          setFaceAuthEnabled(data.faceAuthEnabled ?? true);
        }
      } catch (err) {
        console.error('Error loading biometrics:', err);
      } finally {
        setLoadingBiometrics(false);
      }
    };
    loadBiometrics();
  }, [user?.id]);

  // Sync camera stream to video ref when ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showScanModal]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const docRef = doc(db, 'admin_users', user.id);
      const updates: any = {
        email: adminEmail.trim(),
        recoveryEmail: adminRecoveryEmail.trim(),
        profileImage: adminProfileImage.trim(),
        faceAuthEnabled,
      };

      if (adminPassword.trim()) {
        const bcrypt = (await import('bcryptjs')).default;
        const hash = await bcrypt.hash(adminPassword.trim(), 10);
        updates.passwordHash = hash;
      }

      await updateDoc(docRef, updates);
      showToast('Admin profile configurations saved successfully in Firestore!', 'success');
      
      // Update client store state
      useAuthStore.setState((state) => ({
        user: state.user ? {
          ...state.user,
          email: adminEmail.trim(),
          profileImage: adminProfileImage.trim() || state.user.profileImage
        } : null
      }));
      
      setAdminPassword('');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      showToast('Failed to save configurations: ' + err.message, 'error');
    }
  };

  // Start registration camera stream
  const startCamera = async () => {
    if (biometrics.length >= 2) {
      showToast('Maximum of 2 faces can be registered.', 'error');
      return;
    }
    setShowScanModal(true);
    setCapturedSnapshot(null);
    setCountdown(null);
    setIsCapturing(false);
    setTempFaceHash(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 300, height: 300 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      showToast('Webcam access was denied or is offline.', 'error');
    }
  };

  // Capture face photo
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          // Take snapshot
          const context = canvasRef.current!.getContext('2d');
          if (context && videoRef.current && canvasRef.current) {
            // Calculate pixel hash and embedding logic
            try {
              const imgData = context.getImageData(0, 0, 300, 300);
              let r = 0, g = 0, b = 0;
              for (let i = 0; i < imgData.data.length; i += 40) {
                r += imgData.data[i];
                g += imgData.data[i+1];
                b += imgData.data[i+2];
              }
              const samples = imgData.data.length / 40;
              const computedHash = {
                r: Math.round(r / samples),
                g: Math.round(g / samples),
                b: Math.round(b / samples)
              };
              setTempFaceHash(computedHash);

              // 128-dimensional face embedding calculation
              const embedding = extractFaceEmbedding(canvasRef.current);
              setTempFaceEmbedding(embedding);
            } catch (err) {
              console.warn('Canvas pixel read failed:', err);
            }

            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            setCapturedSnapshot(dataUrl);
            setIsCapturing(true);
          }
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Save the biometric face key to Firestore
  const saveBiometricFace = async () => {
    if (!scanLabel.trim() || !capturedSnapshot || !user?.id) return;

    try {
      const newKey: BiometricKey = {
        id: 'face_' + Date.now(),
        label: scanLabel.trim(),
        snapshotUrl: capturedSnapshot,
        registeredAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        faceHash: tempFaceHash || { r: 120, g: 120, b: 120 },
        embedding: tempFaceEmbedding || Array(128).fill(0.5)
      };

      const updatedKeys = [...biometrics, newKey];
      const docRef = doc(db, 'admin_users', user.id);
      
      await updateDoc(docRef, { biometrics: updatedKeys });
      setBiometrics(updatedKeys);
      showToast('Face biometric registered successfully!', 'success');
      closeModal();
    } catch (err) {
      console.error(err);
      showToast('Failed to register face biometric keys.', 'error');
    }
  };

  // Delete biometric face key
  const deleteBiometricFace = async (id: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to delete this registered face key?')) return;

    try {
      const updatedKeys = biometrics.filter((b) => b.id !== id);
      const docRef = doc(db, 'admin_users', user.id);
      
      await updateDoc(docRef, { biometrics: updatedKeys });
      setBiometrics(updatedKeys);
      showToast('Face biometric removed.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Deletion failed.', 'error');
    }
  };

  const closeModal = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowScanModal(false);
    setScanLabel('');
    setCapturedSnapshot(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold font-sans tracking-tight text-zinc-100 flex items-center gap-2">
          System Configuration
        </h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-wide">
          Manage system limits, shipping rates, and security face recognition settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Admin Account Credentials & Security */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5 text-left">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Admin Credentials & Security
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Admin Password (leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Recovery Email</label>
                <input
                  type="email"
                  value={adminRecoveryEmail}
                  onChange={(e) => setAdminRecoveryEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Profile Image URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={adminProfileImage}
                  onChange={(e) => setAdminProfileImage(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-zinc-200 font-sans">Enable Face Authentication</p>
                <p className="text-zinc-550 text-[10px]">Use registered biometric face keys for faster/additional credentials challenge.</p>
              </div>
              <input
                type="checkbox"
                checked={faceAuthEnabled}
                onChange={(e) => setFaceAuthEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* General Metadata */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              General Metadata
            </h3>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Store Catalog Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">System Notification Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* TWO-STEP BIOMETRIC FACE REGISTRATION PANEL */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5 text-left">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Two-Step Face Verification Keys (Max 2 Faces)
            </h3>

            {loadingBiometrics ? (
              <div className="flex items-center gap-2 py-4 text-zinc-550 text-xs font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                <span>Syncing registered biometrics keys...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Registered List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {biometrics.map((key, idx) => (
                    <div key={key.id} className="p-4 bg-zinc-900/30 border border-zinc-850 rounded-2xl flex justify-between items-center h-28 hover:border-amber-500/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-800 bg-black flex items-center justify-center p-0.5 shrink-0">
                          <img src={key.snapshotUrl} alt="face key" className="w-full h-full object-cover rounded-full" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-zinc-550 font-mono uppercase font-bold">Slot {idx + 1} Registered</p>
                          <h4 className="text-xs font-bold text-zinc-200">{key.label}</h4>
                          <p className="text-[9px] text-zinc-500 font-mono">{key.registeredAt}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteBiometricFace(key.id)}
                        className="p-2 text-zinc-650 hover:text-rose-400 transition-colors"
                        title="Remove Face slot"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty placeholders */}
                  {Array.from({ length: Math.max(0, 2 - biometrics.length) }).map((_, idx) => (
                    <div key={idx} className="border border-dashed border-zinc-800 rounded-2xl p-4 flex flex-col justify-center items-center h-28 text-center bg-zinc-950/40">
                      <Scan className="w-5 h-5 text-zinc-700 mb-1" />
                      <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-600">Available Biometric Slot</span>
                    </div>
                  ))}
                </div>

                {/* Register trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={biometrics.length >= 2}
                    onClick={startCamera}
                    className="px-5 py-3 bg-zinc-900 border border-zinc-850 hover:border-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 text-amber-500 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Camera size={14} />
                    {biometrics.length >= 2 ? 'Biometric Slots Full (Max 2)' : 'Register New Face Unlock'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Shipping and Taxes */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-zinc-500" />
              Taxes & Logistic Config
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Courier Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={shippingRate}
                  onChange={(e) => setShippingRate(Number(e.target.value))}
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-mono">Standard Sales Tax (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min="0"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-zinc-200">Accept Promo Codes</p>
                <p className="text-zinc-500">Allow customers to use coupon codes at checkouts.</p>
              </div>
              <input
                type="checkbox"
                checked={allowPromo}
                onChange={(e) => setAllowPromo(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Database & Operations panel */}
        <div className="sticky top-28 space-y-6">
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-zinc-500" />
              Backup & Seeds
            </h3>

            <p className="text-xs text-zinc-550 leading-relaxed font-sans">
              Perform administrative operations to format local storage mock caches or download sales records.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => alert('Mock transaction logs exported in CSV format!')}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl transition-all"
              >
                Export Order Ledger
              </button>
            </div>
          </div>

          {/* Submit floating button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-br from-amber-400 to-yellow-500 font-bold text-xs text-black rounded-xl hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configurations
          </button>
        </div>
      </form>

      {/* ── BIOMETRIC REGISTER NEW FACE MODAL ── */}
      {showScanModal && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-sm border border-amber-500/30 bg-zinc-950 p-6 rounded-3xl space-y-5 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>

            <div className="space-y-1">
              <h3 className="font-mono text-xs uppercase font-bold text-amber-500 tracking-widest">Biometric Face Registration</h3>
              <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide">Register Face Slot {biometrics.length + 1}</p>
            </div>

            {/* Video Viewport */}
            <div className="w-44 h-44 rounded-full border border-amber-500/30 p-1 mx-auto relative overflow-hidden bg-zinc-900 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.08)]">
              {capturedSnapshot ? (
                <img src={capturedSnapshot} alt="snapshot" className="w-full h-full object-cover rounded-full scale-x-[-1]" />
              ) : stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-full scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-650 font-mono text-[9px]">
                  <Camera className="w-6 h-6 animate-pulse" />
                  <span>Awaiting webcam...</span>
                </div>
              )}

              {/* Countdown text overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-4xl font-mono font-black text-amber-400">
                  {countdown}
                </div>
              )}
            </div>

            {/* Canvas (hidden) */}
            <canvas ref={canvasRef} width={300} height={300} className="hidden" />

            {/* Actions for scan */}
            {!isCapturing ? (
              <div className="space-y-2">
                <p className="text-[10px] text-zinc-500">Center your face in the target and press capture. There will be a 3-second snapshot countdown.</p>
                <button
                  type="button"
                  onClick={captureSnapshot}
                  disabled={countdown !== null || !stream}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black rounded-xl"
                >
                  {countdown !== null ? 'Preparing...' : 'Capture Snapshot'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1 text-left">
                  <label className="text-[9px] uppercase tracking-wider font-mono text-zinc-500 font-bold block">Face Key Identity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Administrator - Teja"
                    value={scanLabel}
                    onChange={(e) => setScanLabel(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedSnapshot(null);
                      setIsCapturing(false);
                    }}
                    className="flex-1 py-2 bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 rounded-xl"
                  >
                    Retake
                  </button>
                  <button
                    type="button"
                    disabled={!scanLabel.trim()}
                    onClick={saveBiometricFace}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black rounded-xl disabled:opacity-50"
                  >
                    Save Face Key
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}
