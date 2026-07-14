'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Input } from '@/components/common/Input';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, Phone, FileText, SendHorizontal, Clock } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const mockFaqs: FaqItem[] = [
  {
    q: 'How do I track my order?',
    a: 'You can check your order status directly from your Profile page or using the tracking number sent to your email after your order is dispatched.',
  },
  {
    q: 'What is the refund escrow policy?',
    a: 'We hold transaction funds in secure escrow for 30 days. If you request a return, we issue a pre-paid priority shipping slip. Once the device is inspected, the escrow releases funds back to your wallet.',
  },
  {
    q: 'How long does a mobile repair service take?',
    a: 'Standard diagnostic and repair takes 2-3 business days. Courier pickup and return is overnight, so your total time without the device is less than 5 days.',
  },
];

export default function SupportPage() {
  const { showToast } = useUIStore();

  // Accordion active state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Contact form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');

  // Callback scheduler state
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackDate, setCallbackDate] = useState('');

  // Chat window state
  const [liveChatMessages, setLiveChatMessages] = useState([
    { id: '1', sender: 'agent', text: 'Thank you for connecting with Bujji Support. How can I assist you with your mobile devices or repair orders today?' },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendLiveMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === '') return;
    const userMsg = { id: Math.random().toString(), sender: 'user', text: chatInput };
    setLiveChatMessages((p) => [...p, userMsg]);
    setChatInput('');

    setTimeout(() => {
      const agentReply = {
        id: Math.random().toString(),
        sender: 'agent',
        text: 'Understood. A corporate concierge has been assigned to your ticket. Please keep this panel open.',
      };
      setLiveChatMessages((p) => [...p, agentReply]);
    }, 1500);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Support ticket registered. Representative will email you.', 'success');
    setTicketSubject('');
    setTicketDesc('');
  };

  const handleScheduleCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone || !callbackDate) return;
    showToast(`VIP Call scheduled for ${callbackDate}.`, 'success');
    setCallbackPhone('');
    setCallbackDate('');
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      {/* Page Header */}
      <div className="border-b border-white/5 pb-8 mb-10">
        <p className="text-[10px] text-primary-gold font-bold tracking-[0.25em] uppercase mb-2">Concierge & Help</p>
        <h1 className="font-display font-black text-4xl sm:text-5xl uppercase tracking-tight text-white">Support Center</h1>
        <p className="text-sm text-zinc-500 mt-2">Acquire technical resources, schedule priority callbacks, or chat with a representative.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: FAQ & Ticket Creation */}
        <div className="lg:col-span-2 space-y-8">
          {/* FAQs Accordion */}
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <HelpCircle size={15} className="text-primary-gold" />
              <span>FAQ Forum</span>
            </h2>

            <div className="divide-y divide-white/5 space-y-1">
              {mockFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-xs text-zinc-200 hover:text-primary-gold font-bold text-left transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={14} className="text-primary-gold" /> : <ChevronDown size={14} />}
                    </button>
                    {isOpen && (
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium mt-3 pl-3 border-l border-primary-gold/40">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Ticket creation */}
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <FileText size={15} className="text-primary-gold" />
              <span>Submit Service Request</span>
            </h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <Input label="Query Subject" required value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} />
              <div className="flex flex-col space-y-1.5 w-full">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-450">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Describe your payment, account, or custom configuration issue..."
                  className="w-full bg-white/3 border border-white/6 text-xs px-4 py-3 rounded-xl text-zinc-200 placeholder-zinc-650 focus:outline-none focus:border-primary-gold transition-colors"
                />
              </div>
              <button type="submit" className="btn-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider">
                Register Ticket
              </button>
            </form>
          </div>

          {/* Callback scheduler */}
          <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-5">
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Phone size={15} className="text-primary-gold" />
              <span>Request Phone Callback</span>
            </h2>

            <form onSubmit={handleScheduleCallback} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-end">
              <div className="flex-1 w-full">
                <Input label="Callback Number" required type="tel" placeholder="+91 98765 43210" value={callbackPhone} onChange={(e) => setCallbackPhone(e.target.value)} />
              </div>
              <div className="flex-1 w-full">
                <Input label="Preferred Date" required type="date" value={callbackDate} onChange={(e) => setCallbackDate(e.target.value)} />
              </div>
              <button type="submit" className="btn-gold py-3 px-6 text-xs font-bold uppercase tracking-wider shrink-0 w-full sm:w-auto">
                Schedule Call
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Live Chat Concierge */}
        <div className="lg:col-span-1">
          <div className="ultra-glass rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[520px] justify-between">
            <div className="bg-[#0b0b0b] px-5 py-4.5 border-b border-white/5 flex items-center gap-2.5 text-left">
              <MessageSquare size={16} className="text-primary-gold" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Concierge Live Chat</h3>
                <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Response time: &lt; 2 mins
                </p>
              </div>
            </div>

            {/* Chat message listing */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-white/1">
              {liveChatMessages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs text-left border ${
                        isUser
                          ? 'bg-white/5 border-white/8 text-zinc-100 rounded-tr-none'
                          : 'bg-primary-gold/5 border-primary-gold/15 text-primary-gold rounded-tl-none'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input panel */}
            <form onSubmit={handleSendLiveMessage} className="p-3 bg-[#0b0b0b] border-t border-white/5 flex space-x-2">
              <input
                type="text"
                required
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Talk to support Concierge..."
                className="flex-1 bg-white/3 border border-white/6 px-4 py-2.5 text-xs rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold transition-colors"
              />
              <button type="submit" className="bg-primary-gold hover:bg-light-gold text-black p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95">
                <SendHorizontal size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
