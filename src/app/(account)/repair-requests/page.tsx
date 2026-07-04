'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Wrench, Calendar, MapPin, Upload, ChevronRight, HelpCircle } from 'lucide-react';

export default function RepairRequestsPage() {
  const router = useRouter();
  const { repairRequests, addresses, submitRepairRequest, isLoading } = useUserStore();
  const { showToast } = useUIStore();

  const [deviceName, setDeviceName] = useState('Bujji Gold-Phantom Smartphone');
  const [issueDesc, setIssueDesc] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00 AM - 01:00 PM');
  const [mockFiles, setMockFiles] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issueDesc.trim() === '' || !selectedAddressId || !preferredDate) {
      showToast('Please fulfill all required fields.', 'warning');
      return;
    }

    const pickupAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    
    try {
      const ticket = await submitRepairRequest(
        deviceName,
        issueDesc,
        mockFiles.length > 0 ? mockFiles : ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=800&auto=format&fit=crop&q=80'],
        pickupAddress,
        preferredDate,
        preferredTime
      );
      showToast('Repair ticket registered successfully!', 'success');
      setIssueDesc('');
      router.push(`/repair-requests/${ticket.id}`);
    } catch {
      showToast('Fulfillment failed. Try again.', 'error');
    }
  };

  const handleMockUpload = () => {
    showToast('Simulating image upload...', 'info');
    setTimeout(() => {
      setMockFiles(['https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80']);
      showToast('Scuffed metal photo uploaded.', 'success');
    }, 1000);
  };

  const statusColors = {
    submitted: 'border-yellow-500/20 bg-yellow-950/20 text-yellow-400',
    received: 'border-blue-500/20 bg-blue-950/20 text-blue-400',
    inspecting: 'border-purple-500/20 bg-purple-950/20 text-purple-400',
    repairing: 'border-orange-500/20 bg-orange-950/20 text-orange-400',
    completed: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Bujji Concierge</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Repair Services</h1>
        <p className="text-sm text-zinc-500 mt-2">Request gold bumper polishing, solid battery swaps, or custom panel refitting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="ultra-glass rounded-2xl border border-white/5 p-7 space-y-6">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Wrench size={15} className="text-primary-gold" />
              <span>Create Repair Ticket</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Device Selector */}
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Device Model</label>
                <select
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/3 border border-white/8 text-sm rounded-xl text-zinc-200 focus:outline-none focus:border-primary-gold transition-colors"
                >
                  <option value="Bujji Gold-Phantom Smartphone">Bujji Gold-Phantom Smartphone</option>
                  <option value="AeroBuds Gold Premium Edition">AeroBuds Gold Premium Edition</option>
                  <option value="Bujji Chronos Premium Smartwatch">Bujji Chronos Premium Smartwatch</option>
                  <option value="Custom Device (Not listed)">Custom Device Finish</option>
                </select>
              </div>

              {/* Issue Description */}
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Diagnostic Details</label>
                <textarea
                  required
                  rows={4}
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe scratches, bezel scuffs, or structural issues..."
                  className="w-full px-4 py-3 bg-white/3 border border-white/8 text-sm rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold transition-colors"
                />
              </div>

              {/* Upload scuffs image */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Diagnostic Photo (Optional)</label>
                <div
                  onClick={handleMockUpload}
                  className="border border-dashed border-white/10 hover:border-primary-gold/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer bg-white/2"
                >
                  <Upload size={20} className="text-zinc-500" />
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Drag/Click to upload scuffs or cracks photo</span>
                  {mockFiles.length > 0 && (
                    <span className="text-[10px] text-primary-gold font-bold uppercase tracking-wider">Image Loaded: bumper-scuff.png ✦</span>
                  )}
                </div>
              </div>

              {/* Pickup Address */}
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Courier Pickup Location</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/3 border border-white/8 text-sm rounded-xl text-zinc-200 focus:outline-none focus:border-primary-gold transition-colors"
                >
                  <option value="">Select pickup address</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.street}, {a.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Time selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Pickup Date"
                  type="date"
                  required
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                />
                <div className="flex flex-col space-y-1.5 w-full">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Hour Interval</label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-4 py-3 bg-white/3 border border-white/8 text-sm rounded-xl text-zinc-200 focus:outline-none focus:border-primary-gold transition-colors"
                  >
                    <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                    <option value="01:00 PM - 04:00 PM">01:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 07:00 PM">04:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-gold w-full py-4 text-xs font-bold uppercase tracking-wider">
                  Submit Diagnostic Ticket
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Tickets list */}
        <div className="lg:col-span-1">
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-6">
            <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Active Repair Tickets</h3>

            {repairRequests.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle size={24} className="text-zinc-700 mx-auto mb-2 animate-bounce" />
                <p className="text-[10px] text-zinc-500">No repair tickets in your database log.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repairRequests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => router.push(`/repair-requests/${req.id}`)}
                    className="w-full p-4 bg-white/3 border border-white/6 hover:border-primary-gold/30 rounded-xl text-left transition-all space-y-3 block focus:outline-none"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-zinc-500 font-mono font-bold">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider font-mono ${statusColors[req.status]}`}>
                        {req.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{req.deviceName}</h4>
                      <p className="text-[10px] text-zinc-500 mt-1 line-clamp-1">{req.issueDesc}</p>
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-zinc-400 pt-2 border-t border-zinc-900 uppercase font-semibold tracking-wider">
                      <span>Schedule: {req.preferredDate}</span>
                      <ChevronRight size={10} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
