'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { Timeline } from '@/components/common/Timeline';
import { ArrowLeft, Send, ShieldAlert, User, ShieldCheck } from 'lucide-react';

export default function RepairDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { repairRequests, addRepairMessage } = useUserStore();
  const { showToast } = useUIStore();

  const req = repairRequests.find((r) => r.id === id);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [req?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === '' || !req) return;

    const messageText = chatInput;
    setChatInput('');
    
    // Add user message
    await addRepairMessage(req.id, messageText, 'user');
    showToast('Message sent to technician.', 'info');
  };

  if (!req) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <ShieldAlert size={40} className="text-red-500 mx-auto animate-pulse" />
        <h2 className="text-lg font-bold uppercase text-white">Repair Ticket Unavailable</h2>
        <button onClick={() => router.push('/repair-requests')} className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
          Back to Repairs
        </button>
      </div>
    );
  }

  // Define steps
  const steps = [
    { title: 'Ticket Submitted', completed: true, description: 'Diagnostic request entered into ledger.' },
    { title: 'Courier Received', completed: ['received', 'inspecting', 'repairing', 'completed'].includes(req.status), description: 'Device received at regional diagnostic hub.' },
    { title: 'Technical Inspection', completed: ['inspecting', 'repairing', 'completed'].includes(req.status), description: 'Technicians analyzing chassis, alloys, and screens.' },
    { title: 'Active Repair Work', completed: ['repairing', 'completed'].includes(req.status), description: 'Device work in progress.' },
    { title: 'Repolished & Shipped', completed: req.status === 'completed', description: 'Polishing completed. Back in courier routing.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 text-left">
      <button
        onClick={() => router.push('/repair-requests')}
        className="flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-primary-gold mb-6 uppercase tracking-wider font-semibold transition-colors"
      >
        <ArrowLeft size={12} />
        <span>Back to Repairs</span>
      </button>

      <div className="border-b border-white/5 pb-8 mb-10 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-mono">Service Request File</span>
          <h1 className="font-display font-black text-xl text-white uppercase tracking-wider mt-1">
            Ticket: <span className="font-mono text-primary-gold">{req.id}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Diagnostic state tracking for: <span className="font-semibold text-zinc-200">{req.deviceName}</span></p>
        </div>

        {req.cost && (
          <div className="text-right">
            <span className="text-[9px] text-zinc-550 uppercase tracking-widest font-bold">Estimated Cost</span>
            <p className="text-lg font-black text-primary-gold">₹{req.cost.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Details & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          {/* Steps tracking */}
          <div className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-6 text-left">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-white">Progression</h3>
            <Timeline steps={steps} />
          </div>

          {/* Details Card */}
          <div className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-3 text-left">
            <h3 className="font-display font-black text-xs uppercase text-white">Request Details</h3>
            <div className="space-y-2 text-xs text-zinc-400">
              <p><span className="font-bold text-zinc-300">Model:</span> {req.deviceName}</p>
              <p><span className="font-bold text-zinc-300">Issue:</span> {req.issueDesc}</p>
              <p><span className="font-bold text-zinc-300">Pickup Date:</span> {req.preferredDate} ({req.preferredTime})</p>
              <p><span className="font-bold text-zinc-300">Address:</span> {req.pickupAddress.street}, {req.pickupAddress.city}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat with Technician */}
        <div className="lg:col-span-2">
          <div className="ultra-glass rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[550px] justify-between">
            {/* Chat Header */}
            <div className="bg-[#0b0b0b] px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border border-primary-gold/30 bg-zinc-900 flex items-center justify-center text-primary-gold shrink-0">
                  <User size={14} />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Hub Support Representative</h4>
                  <p className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse mr-1" />
                    <span>Technical Support Online</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Body messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white/1">
              {req.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed text-left border ${
                        isUser
                          ? 'bg-white/5 border-white/8 text-zinc-200 rounded-tr-none'
                          : 'bg-primary-gold/5 border-primary-gold/15 text-primary-gold rounded-tl-none shadow-[0_0_10px_rgba(212,175,55,0.02)]'
                      }`}
                    >
                      <p className="font-medium">{msg.text}</p>
                      <span className="text-[8px] text-zinc-550 font-mono block text-right mt-1.5">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input panel */}
            <form onSubmit={handleSendMessage} className="bg-[#0b0b0b] p-4 border-t border-white/5 flex space-x-3 items-center">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type messages to diagnostic team..."
                className="flex-1 bg-white/3 border border-white/6 text-xs px-4 py-3 rounded-xl text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-primary-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-primary-gold hover:bg-light-gold text-pure-black p-3.5 rounded-xl transition-colors focus:outline-none"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
