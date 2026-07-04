'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, CreditCard, MapPin, Truck, ChevronRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useOrderStore } from '@/store/orderStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotals } = useCartStore();
  const { addresses, cards, addAddress, addCard } = useUserStore();
  const { createOrder } = useOrderStore();
  const { showToast } = useUIStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Address Step States
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || '');
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrState, setNewAddrState] = useState('');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [showNewAddrForm, setShowNewAddrForm] = useState(false);

  // Shipping Step States
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Step States
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id || '');
  const [newCardHolder, setNewCardHolder] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  const { subtotal, discount, shipping: baseShipping, total: baseTotal } = getTotals();

  // Recalculate shipping based on choice
  const actualShipping = shippingMethod === 'express' ? 15 : baseShipping;
  const actualTotal = subtotal - discount + actualShipping;

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrStreet || !newAddrCity || !newAddrZip) return;
    const newAddr = {
      name: newAddrName || 'Saved Address',
      street: newAddrStreet,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      phone: newAddrPhone,
      isDefault: false,
    };
    addAddress(newAddr);
    showToast('Delivery address saved.', 'success');
    setShowNewAddrForm(false);
    // Select the newly added address (which will be at the end of the array)
    // For simplicity, we can let user click select, or default back.
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardHolder || !newCardNumber) return;
    const newCard = {
      holderName: newCardHolder,
      cardNumber: 'â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ â€¢â€¢â€¢â€¢ ' + newCardNumber.slice(-4),
      expiry: newCardExpiry,
      cardType: 'visa' as const,
    };
    addCard(newCard);
    showToast('Payment method saved.', 'success');
    setShowNewCardForm(false);
  };

  const handleCompleteCheckout = async () => {
    const address = addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    const card = cards.find((c) => c.id === selectedCardId) || cards[0];
    
    if (!address) {
      showToast('Please specify a delivery address.', 'error');
      setStep(1);
      return;
    }

    try {
      const order = await createOrder(
        items,
        { subtotal, discount, shipping: actualShipping, total: actualTotal },
        address,
        card ? `${card.cardType.toUpperCase()} ending in ${card.cardNumber.slice(-4)}` : 'Alternative Escrow'
      );
      
      showToast('Order registered successfully on blockchain!', 'success');
      clearCart();
      router.push(`/orders/${order.id}`);
    } catch {
      showToast('Transaction failed. Try again.', 'error');
    }
  };

  const stepsMeta = [
    { num: 1, label: 'Delivery', icon: <MapPin size={14} /> },
    { num: 2, label: 'Shipping', icon: <Truck size={14} /> },
    { num: 3, label: 'Payment', icon: <CreditCard size={14} /> },
    { num: 4, label: 'Review', icon: <Check size={14} /> },
  ];

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center space-y-6">
        <ShoppingBag size={48} className="text-zinc-700 mx-auto" />
        <h2 className="text-lg font-bold">No active checkout session</h2>
        <button onClick={() => router.push('/products')} className="btn-gold px-8 py-3 text-xs font-bold uppercase tracking-wider">
          Go to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 text-left">
      {/* Checkout step indicator tracker */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center justify-between relative">
          {stepsMeta.map((s, idx) => (
            <React.Fragment key={s.num}>
              <button
                disabled={s.num > step}
                onClick={() => setStep(s.num as any)}
                className="flex flex-col items-center space-y-2 focus:outline-none z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    step >= s.num
                      ? 'bg-primary-gold border-primary-gold text-pure-black shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {s.icon}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${step >= s.num ? 'text-primary-gold' : 'text-zinc-500'}`}>
                  {s.label}
                </span>
              </button>
              {idx < stepsMeta.length - 1 && (
                <div className={`flex-1 h-[2px] -mt-5 mx-2 ${step > s.num ? 'bg-primary-gold' : 'bg-white/8'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main interactive form */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Address selection */}
          {step === 1 && (
            <div className="ultra-glass p-6 rounded-2xl border border-white/5 space-y-6">
              <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">Select Delivery Destination</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-36 ${
                      selectedAddressId === addr.id
                        ? 'border-primary-gold bg-primary-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{addr.name}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{addr.street}</p>
                      <p className="text-[10px] text-zinc-400">{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-mono mt-2">{addr.phone}</p>
                  </button>
                ))}
              </div>

              {/* Add address toggle */}
              {!showNewAddrForm ? (
                <Button variant="outline" size="sm" onClick={() => setShowNewAddrForm(true)}>
                  Add New Address
                </Button>
              ) : (
                <form onSubmit={handleAddNewAddress} className="border-t border-zinc-900 pt-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase text-zinc-400">New Address Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Label (e.g. Home, Work)" required value={newAddrName} onChange={(e) => setNewAddrName(e.target.value)} />
                    <Input label="Phone Number" required value={newAddrPhone} onChange={(e) => setNewAddrPhone(e.target.value)} />
                  </div>
                  <Input label="Street Address" required value={newAddrStreet} onChange={(e) => setNewAddrStreet(e.target.value)} />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="City" required value={newAddrCity} onChange={(e) => setNewAddrCity(e.target.value)} />
                    <Input label="State" required value={newAddrState} onChange={(e) => setNewAddrState(e.target.value)} />
                    <Input label="ZIP" required value={newAddrZip} onChange={(e) => setNewAddrZip(e.target.value)} />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Button type="submit" variant="gold" size="sm">Save Address</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewAddrForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              <div className="pt-4 border-t border-zinc-900 flex justify-end">
                <Button variant="gold" size="md" onClick={() => setStep(2)} disabled={!selectedAddressId}>
                  <span>Continue to Shipping</span>
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping method */}
          {step === 2 && (
            <div className="glass-panel p-6 rounded-xl border border-zinc-900 space-y-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-300">Choose Shipping Speed</h2>
              
              <div className="space-y-4">
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-primary-gold bg-primary-gold/5'
                      : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="accent-primary-gold"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Free Air Courier</p>
                      <p className="text-[10px] text-zinc-400">Delivered within 3-5 business days.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">FREE</span>
                </label>

                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-primary-gold bg-primary-gold/5'
                      : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="accent-primary-gold"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white uppercase tracking-wider">Hyper Courier Express</p>
                      <p className="text-[10px] text-zinc-400">Next-day premium priority delivery.</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary-gold">â‚¹15.00</span>
                </label>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(1)}>Back</Button>
                <Button variant="gold" size="md" onClick={() => setStep(3)}>
                  <span>Continue to Payment</span>
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment details */}
          {step === 3 && (
            <div className="glass-panel p-6 rounded-xl border border-zinc-900 space-y-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-300">Secure Payment Channel</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-36 relative overflow-hidden ${
                      selectedCardId === card.id
                        ? 'border-primary-gold bg-primary-gold/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                        : 'border-zinc-850 bg-zinc-950/40 hover:border-zinc-700'
                    }`}
                  >
                    <div className="absolute top-2 right-2 text-zinc-650 opacity-40 uppercase tracking-widest text-[9px] font-bold font-mono">
                      {card.cardType}
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{card.holderName}</p>
                      <p className="text-xs font-mono font-bold text-white tracking-widest mt-2">{card.cardNumber}</p>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-mono">EXP: {card.expiry}</p>
                  </button>
                ))}
              </div>

              {!showNewCardForm ? (
                <Button variant="outline" size="sm" onClick={() => setShowNewCardForm(true)}>
                  Add New Card
                </Button>
              ) : (
                <form onSubmit={handleAddNewCard} className="border-t border-zinc-900 pt-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase text-zinc-400">New Card Details</h3>
                  <Input label="Cardholder Name" required value={newCardHolder} onChange={(e) => setNewCardHolder(e.target.value)} />
                  <Input label="Card Number" required maxLength={16} placeholder="16-digit card number" value={newCardNumber} onChange={(e) => setNewCardNumber(e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Expiry (MM/YY)" required placeholder="MM/YY" value={newCardExpiry} onChange={(e) => setNewCardExpiry(e.target.value)} />
                    <Input label="CVV" required maxLength={3} placeholder="CVV" type="password" value={newCardCvv} onChange={(e) => setNewCardCvv(e.target.value)} />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Button type="submit" variant="gold" size="sm">Save Payment Card</Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewCardForm(false)}>Cancel</Button>
                  </div>
                </form>
              )}

              <div className="pt-6 border-t border-zinc-900 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(2)}>Back</Button>
                <Button variant="gold" size="md" onClick={() => setStep(4)} disabled={!selectedCardId}>
                  <span>Review Final Order</span>
                  <ChevronRight size={14} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Review final order */}
          {step === 4 && (
            <div className="glass-panel p-6 rounded-xl border border-zinc-900 space-y-6">
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-300">Final Audit Review</h2>
              
              <div className="space-y-4 text-xs text-zinc-400">
                <div className="flex justify-between border-b border-zinc-900 pb-3">
                  <span>Shipping Address</span>
                  <span className="text-zinc-200 text-right">
                    {addresses.find((a) => a.id === selectedAddressId)?.street}, {addresses.find((a) => a.id === selectedAddressId)?.city}
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-3">
                  <span>Carrier Speed</span>
                  <span className="text-zinc-200 uppercase tracking-widest font-semibold">
                    {shippingMethod === 'express' ? 'Hyper Courier (Next-Day)' : 'Free Air Courier (Standard)'}
                  </span>
                </div>
                <div className="flex justify-between pb-3">
                  <span>Payment Wallet</span>
                  <span className="text-zinc-200">
                    Visa card ending in {cards.find((c) => c.id === selectedCardId)?.cardNumber.slice(-4)}
                  </span>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900 flex justify-between">
                <Button variant="outline" size="md" onClick={() => setStep(3)}>Back</Button>
                <Button variant="gold" size="md" onClick={handleCompleteCheckout}>
                  Complete Purchase Transaction
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right side checkout preview bar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-zinc-900 space-y-4 text-left">
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-zinc-400">Your Allocation</h3>
            
            <div className="divide-y divide-zinc-900 max-h-64 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-800">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-250 truncate">{item.product.name}</h4>
                    <p className="text-[9px] text-zinc-500">{item.selectedColor} / {item.selectedStorage}</p>
                    <div className="flex justify-between items-center text-[10px] mt-1">
                      <span className="text-zinc-400">Qty: {item.quantity}</span>
                      <span className="font-semibold text-primary-gold">?{item.product.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-900 pt-3 space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>?{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{actualShipping === 0 ? 'FREE' : `â‚¹${actualShipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-zinc-900">
                <span>Aggregate Total</span>
                <span className="text-primary-gold">?{actualTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
