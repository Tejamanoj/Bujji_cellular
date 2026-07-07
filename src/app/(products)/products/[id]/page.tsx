'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Shield,
  RefreshCw,
  Truck,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Send,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  CreditCard,
  Gift,
  HelpCircle,
  Play,
  ShoppingCart
} from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { Rating } from '@/components/common/Rating';
import { Loader } from '@/components/common/Loader';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { products } = useProductStore();
  const { addItem } = useCartStore();
  const { wishlist, toggleWishlist } = useUserStore();
  const { showToast } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  const id = params.id as string;
  const product = products.find((p) => p.id === id);

  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'qa'>('specs');
  
  // Custom Reviews state
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<any[]>([]);

  // Q&A state
  const [newQuestion, setNewQuestion] = useState('');
  const [qaList, setQaList] = useState<any[]>([]);

  // Image zoom state
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // Fullscreen modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  // FBT Bundle check states
  const [fbtChecked, setFbtChecked] = useState<{ [key: string]: boolean }>({});

  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedColor(product.colors?.[0] || '');
      setSelectedStorage(product.storage?.[0] || '');
      setReviewsList(product.reviews || []);
      setQaList(product.qa || []);
      
      // Default all FBT accessories to checked
      const initialChecked: { [key: string]: boolean } = {};
      const fbtList = products.filter(p => p.id !== product.id && (p.category === 'phone-accessories' || p.category === 'audio')).slice(0, 2);
      fbtList.forEach(item => {
        initialChecked[item.id] = true;
      });
      setFbtChecked(initialChecked);

      setLoading(false);
    } else {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [product, products]);

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-2xl font-bold">Model Not Found</h1>
        <p className="text-zinc-500 text-sm">The selected device model is unavailable or has been archived.</p>
        <Button variant="gold" onClick={() => router.push('/products')}>
          Back to Catalog
        </Button>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  // accessories fetch
  const compatibleAccessories = products.filter((p) => {
    if (p.id === product.id) return false;
    return p.category === 'phone-accessories' || p.category === 'audio';
  }).slice(0, 4);

  // FBT Bundle list calculations
  const fbtList = compatibleAccessories.slice(0, 2);
  const checkedFbtItems = fbtList.filter(item => fbtChecked[item.id]);
  const bundleTotal = product.price + checkedFbtItems.reduce((sum, item) => sum + item.price, 0);
  const bundleSavings = checkedFbtItems.length > 0 ? Math.floor(bundleTotal * 0.1) : 0; // 10% discount on bundle
  const bundlePrice = bundleTotal - bundleSavings;

  // Zoom mouse track
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  // Next and Previous Image in gallery
  const handlePrevImage = () => {
    const currentIndex = product.images.indexOf(selectedImage);
    const prevIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
    setSelectedImage(product.images[prevIndex]);
  };

  const handleNextImage = () => {
    const currentIndex = product.images.indexOf(selectedImage);
    const nextIndex = currentIndex === product.images.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(product.images[nextIndex]);
  };

  // Delivery check logic
  const handleCheckDelivery = () => {
    if (!pincode || pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit pincode.', 'error');
      return;
    }
    setCheckingDelivery(true);
    setTimeout(() => {
      setCheckingDelivery(false);
      // Mock different dates based on pin
      const firstDigit = pincode.charAt(0);
      if (['1', '2', '3'].includes(firstDigit)) {
        setDeliveryStatus('Delivery by Tomorrow (July 8) · Free express shipment');
      } else if (['4', '5', '6'].includes(firstDigit)) {
        setDeliveryStatus('Delivery within 2 Days (July 9) · Cash on Delivery available');
      } else {
        setDeliveryStatus('Delivery within 4 Days (July 11) · Standard dispatch');
      }
    }, 800);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    const review = {
      id: Math.random().toString(),
      author: 'Teja M (You)',
      rating: newRating,
      comment: newComment,
      date: new Date().toLocaleDateString(),
    };
    setReviewsList([review, ...reviewsList]);
    setNewComment('');
    showToast('Thank you for your premium review!', 'success');
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim() === '') return;
    const qa = {
      id: Math.random().toString(),
      question: newQuestion,
      answer: 'Our corporate technical representative will review and reply shortly.',
    };
    setQaList([qa, ...qaList]);
    setNewQuestion('');
    showToast('Your question was posted successfully.', 'success');
  };

  // Checkout redirect
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      showToast('Please log in to continue.', 'error');
      router.push('/login');
      return;
    }
    addItem(product, quantity, selectedColor || 'Standard', selectedStorage || 'Standard');
    router.push('/checkout');
  };

  // Rating count breakouts
  const averageRating = product.rating || 4.8;
  const ratingDistribution = [
    { stars: 5, percentage: 85 },
    { stars: 4, percentage: 10 },
    { stars: 3, percentage: 3 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      {/* Split Layout: Flipkart/Amazon style */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ── LEFT COLUMN: Image Gallery Visualizer (5 Cols) ── */}
        <div className="lg:col-span-5 space-y-4 sticky top-24">
          
          <div className="flex gap-4">
            {/* Thumbnails list (vertical layout on large screens) */}
            <div className="hidden sm:flex flex-col gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setSelectedImage(img)}
                  onClick={() => setSelectedImage(img)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border bg-zinc-950 flex items-center justify-center p-1.5 transition-all ${
                    selectedImage === img ? 'border-amber-400 ring-1 ring-amber-400/20' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>

            {/* Main Visualizer Panel */}
            <div className="flex-1 relative aspect-square rounded-2xl bg-zinc-950/80 border border-zinc-900 overflow-hidden flex items-center justify-center p-6 group">
              
              {/* Previous/Next Image overlay buttons */}
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-zinc-800 text-zinc-350 hover:text-white flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-zinc-800 text-zinc-350 hover:text-white flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>

              {/* Maximize zoom modal button */}
              <button
                onClick={() => {
                  setModalImageIndex(product.images.indexOf(selectedImage));
                  setIsModalOpen(true);
                }}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 border border-zinc-800 text-zinc-400 hover:text-amber-400 z-10 transition-colors"
                title="Fullscreen Modal View"
              >
                <Maximize2 size={14} />
              </button>

              {/* Main zoomable image frame */}
              <div
                ref={imageRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                className="w-full h-full flex items-center justify-center relative overflow-hidden cursor-zoom-in"
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  className={`max-h-full max-w-full object-contain transition-transform duration-100 ${
                    isZooming ? 'opacity-0 scale-100' : 'opacity-100 scale-100'
                  }`}
                />
                
                {/* Zoom overlay lens window */}
                {isZooming && (
                  <div
                    className="absolute inset-0 bg-no-repeat bg-center"
                    style={{
                      backgroundImage: `url(${selectedImage})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Horizontal thumbnail list (displays on mobile instead) */}
          <div className="sm:hidden flex gap-2 overflow-x-auto py-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-14 h-14 rounded-lg overflow-hidden border bg-zinc-950 flex items-center justify-center p-1 flex-shrink-0 transition-all ${
                  selectedImage === img ? 'border-amber-400' : 'border-zinc-900 opacity-70'
                }`}
              >
                <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
              </button>
            ))}
          </div>
          
        </div>

        {/* ── RIGHT COLUMN: Parameters & Core purchasing details (7 Cols) ── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand and Title */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold bg-amber-500/10 px-2.5 py-1 rounded-full">{product.brand} Official</span>
            <h1 className="font-display font-black text-2xl md:text-3xl text-zinc-100 tracking-tight leading-tight pt-2">
              {product.name}
            </h1>
            
            {/* Rating Stars Breakout Badge */}
            <div className="flex items-center gap-3 pt-1.5">
              <div className="flex items-center gap-1 bg-amber-500 text-black px-2 py-0.5 rounded text-[11px] font-bold">
                <span>{averageRating}</span>
                <Star className="fill-black text-black" size={10} />
              </div>
              <span className="text-xs text-zinc-500 font-semibold">{reviewsList.length} Ratings & Reviews</span>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>

          {/* Price, originalPrice and discount card */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-5 rounded-2xl space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-amber-400 font-mono">₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-zinc-650 line-through font-mono">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-emerald-400 font-bold font-sans">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">inclusive of all GST and duties</p>
          </div>

          {/* Available Offers section */}
          <div className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-3 text-xs">
            <h4 className="font-bold text-zinc-300 font-mono uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <Gift size={13} className="text-amber-500" /> Available Offers
            </h4>
            <div className="space-y-2 font-medium">
              <div className="flex gap-2">
                <CreditCard size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400"><strong className="text-zinc-200">Bank Offer:</strong> Get 10% instant discount up to ₹1,500 on Axis Bank Credit Cards.</p>
              </div>
              <div className="flex gap-2">
                <Shield size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400"><strong className="text-zinc-200">Bujji Care:</strong> 1-Year Extended Plating Gold Shield Warranty coverage.</p>
              </div>
              <div className="flex gap-2">
                <Truck size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-zinc-400"><strong className="text-zinc-200">Express Delivery:</strong> Next-day dispatch with live transit tracking.</p>
              </div>
            </div>
          </div>

          {/* Delivery Checker Box */}
          <div className="border border-zinc-900 bg-zinc-950/40 p-5 rounded-2xl space-y-3">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">Delivery Estimate Checker</label>
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 500001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCheckDelivery}
                disabled={checkingDelivery}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs font-mono font-bold text-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                {checkingDelivery ? 'Checking...' : 'Check'}
              </button>
            </div>
            {deliveryStatus && (
              <p className="text-xs text-amber-500 font-mono mt-1 flex items-center gap-1.5">
                <Truck size={13} /> {deliveryStatus}
              </p>
            )}
          </div>

          {/* Options: Variant Selectors */}
          <div className="space-y-6">
            {/* Color accent finishes */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">Accent Finish Color</span>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full border transition-all relative ${
                        selectedColor === color ? 'border-amber-400 scale-110 ring-2 ring-amber-400/20' : 'border-zinc-800'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check size={12} className="absolute inset-0 m-auto text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage configuration selection */}
            {product.storage && product.storage.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">Memory / Storage Model</span>
                <div className="flex flex-wrap gap-2">
                  {product.storage.map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedStorage(st)}
                      className={`px-4 py-2 text-xs border rounded-lg transition-all ${
                        selectedStorage === st
                          ? 'border-amber-400 bg-amber-400/10 text-amber-400 font-bold'
                          : 'border-zinc-900 text-zinc-400 hover:border-zinc-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">Quantity</span>
              <div className="flex items-center space-x-4 bg-zinc-950 border border-zinc-900 rounded-full w-32 px-3 py-1.5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-zinc-500 hover:text-white">
                  <Minus size={13} />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-zinc-200">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-zinc-500 hover:text-white">
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              className="px-6 py-4 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 text-zinc-200 flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please log in to continue.', 'error');
                  router.push('/login');
                  return;
                }
                addItem(product, quantity, selectedColor || 'Standard', selectedStorage || 'Standard');
                showToast(`Acquired ${quantity}x ${product.name}!`, 'success');
              }}
            >
              <ShoppingCart size={15} />
              Add to Cart
            </button>
            <button
              className="px-6 py-4 bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-yellow-500/10 transition-all cursor-pointer"
              onClick={handleBuyNow}
            >
              <ShoppingBag size={15} />
              Buy Now
            </button>
            <button
              className={`p-4 border rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                isWished ? 'border-rose-500/30 bg-rose-500/10 text-rose-500' : 'border-zinc-850 bg-zinc-900/30 text-zinc-500 hover:text-zinc-350'
              }`}
              onClick={() => {
                if (!isAuthenticated) {
                  showToast('Please log in to continue.', 'error');
                  router.push('/login');
                  return;
                }
                if (user?.id) {
                  toggleWishlist(user.id, product.id);
                  showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
                }
              }}
            >
              <Heart size={16} className={isWished ? 'fill-rose-500' : ''} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-zinc-900">
            <div className="flex items-center space-x-2.5">
              <Truck size={15} className="text-amber-500" />
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Free Air Express</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <RefreshCw size={15} className="text-amber-500" />
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Shield size={15} className="text-amber-500" />
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider font-mono">Plating Warranty</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── BOTTOM SECTION: Technical Specs / Reviews / Q&A ── */}
      <div className="mt-20 border-t border-zinc-900 pt-10">
        
        {/* Highlights Bullet List Card */}
        {product.highlights && product.highlights.length > 0 && (
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl mb-8">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 border-b border-zinc-900 pb-2 mb-4">
              Product Highlights
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans text-zinc-350">
              {product.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex border-b border-zinc-900 space-x-8 mb-8">
          {['specs', 'reviews', 'qa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-xs font-semibold uppercase tracking-widest transition-colors relative ${
                activeTab === tab ? 'text-amber-500' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? 'Client Reviews' : 'Q&A Forum'}
              {activeTab === tab && (
                <motion.div layoutId="detail-tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div>
          {activeTab === 'specs' && (
            <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl overflow-hidden max-w-4xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
                    <th className="px-6 py-4">Specification Parameter</th>
                    <th className="px-6 py-4">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300 font-sans">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-zinc-500 text-[10px] uppercase tracking-wider">{key}</td>
                      <td className="px-6 py-3.5 font-medium">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
              
              {/* Ratings progress breakout */}
              <div className="lg:col-span-1 bg-zinc-950/60 border border-zinc-900 p-6 rounded-2xl space-y-4 h-fit">
                <h4 className="font-mono text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Ratings Breakdown</h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-zinc-100">{averageRating}</span>
                  <span className="text-xs text-zinc-500">/ 5.0</span>
                </div>
                <div className="space-y-2">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-3 text-xs font-mono">
                      <span className="w-3 text-zinc-500">{dist.stars}★</span>
                      <div className="flex-grow h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${dist.percentage}%` }} />
                      </div>
                      <span className="w-8 text-right text-[10px] text-zinc-650">{dist.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  {reviewsList.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No client reviews registered for this model yet.</p>
                  ) : (
                    reviewsList.map((rev) => (
                      <div key={rev.id} className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              {rev.author}
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] tracking-wider uppercase font-mono font-bold">Verified Buyer</span>
                            </p>
                            <span className="text-[9px] text-zinc-600 font-mono">{rev.date}</span>
                          </div>
                          <Rating value={rev.rating} readonly size={12} />
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add review form */}
                <form onSubmit={handleAddReview} className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-white">Submit Feedback</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-550 uppercase font-semibold block font-mono">Rating</label>
                    <Rating value={newRating} onChange={setNewRating} readonly={false} size={16} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-555 uppercase font-semibold block font-mono">Review Comment</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment on premium build quality and features..."
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40 transition-colors"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black rounded-xl cursor-pointer">
                    Submit Review
                  </button>
                </form>
              </div>

            </div>
          )}

          {activeTab === 'qa' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-left">
              {/* QA thread list */}
              <div className="lg:col-span-2 space-y-6">
                {qaList.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No user queries posted yet.</p>
                ) : (
                  qaList.map((qa) => (
                    <div key={qa.id} className="bg-zinc-950/40 p-5 rounded-2xl border border-zinc-900 space-y-3">
                      <p className="text-xs font-bold text-white tracking-wide">Q: {qa.question}</p>
                      <p className="text-xs text-zinc-400 pl-4 border-l border-amber-500/40">A: {qa.answer}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Question Form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleAddQuestion} className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-white">Ask a Question</h4>
                  <textarea
                    required
                    rows={3}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask about design, specs, compatibility..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-xs px-3.5 py-2.5 rounded-xl text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-400/40 transition-colors"
                  />
                  <button type="submit" className="w-full bg-amber-500 hover:bg-amber-400 py-3 text-xs font-bold text-black rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    <Send size={12} />
                    Submit Query
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FREQUENTLY BOUGHT TOGETHER: Interactive Accessories Bundle ── */}
      {fbtList.length > 0 && (
        <div className="mt-24 border-t border-zinc-900 pt-12 text-left">
          <p className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-mono font-bold mb-2">Exclusive Offer Bundle</p>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-8">Frequently Bought Together</h2>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row items-center gap-8 justify-between">
            <div className="flex flex-wrap items-center gap-4 text-white font-black text-lg">
              
              {/* Main Product */}
              <div className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800">
                <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-contain" />
                <div>
                  <h4 className="text-xs font-bold text-zinc-300 truncate w-32">{product.name}</h4>
                  <p className="text-xs text-amber-500 font-bold font-mono">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* FBT Accessories checks loops */}
              {fbtList.map((item) => (
                <React.Fragment key={item.id}>
                  <span className="text-zinc-650 text-xl font-mono">+</span>
                  <div className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 relative">
                    <input
                      type="checkbox"
                      checked={!!fbtChecked[item.id]}
                      onChange={() => setFbtChecked({ ...fbtChecked, [item.id]: !fbtChecked[item.id] })}
                      className="absolute top-2 right-2 rounded border-zinc-800 bg-zinc-950 text-amber-400 focus:ring-0"
                    />
                    <img src={item.images[0]} alt={item.name} className="w-12 h-12 object-contain" />
                    <div>
                      <h4 className="text-xs font-bold text-zinc-300 truncate w-28 pr-4">{item.name}</h4>
                      <p className="text-xs text-amber-500 font-bold font-mono">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            <div className="text-right lg:border-l lg:border-zinc-900 lg:pl-8 space-y-3 w-full lg:w-auto">
              <div>
                <p className="text-[10px] text-zinc-550 uppercase tracking-wider font-mono">Bundle Total Price</p>
                <div className="flex items-baseline justify-end gap-2">
                  <span className="text-2xl font-black text-amber-400 font-mono">₹{bundlePrice.toLocaleString('en-IN')}</span>
                  {bundleSavings > 0 && (
                    <span className="text-xs text-zinc-650 line-through font-mono">₹{bundleTotal.toLocaleString('en-IN')}</span>
                  )}
                </div>
                {bundleSavings > 0 && (
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">Bundle Offer (10% Saved: ₹{bundleSavings.toLocaleString('en-IN')})</p>
                )}
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please log in to continue.', 'error');
                    router.push('/login');
                    return;
                  }
                  // Add main product
                  addItem(product, 1, selectedColor || 'Standard', selectedStorage || 'Standard');
                  // Add checked accessories
                  checkedFbtItems.forEach((item) => {
                    addItem(item, 1, item.colors?.[0] || 'Standard', item.storage?.[0] || 'Standard');
                  });
                  showToast('Bundle added to your cart!', 'success');
                  router.push('/cart');
                }}
                className="w-full lg:w-auto px-6 py-3 bg-gradient-to-br from-amber-400 to-yellow-500 text-xs font-bold text-black uppercase tracking-wider rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                Acquire Complete Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 text-left">
          <p className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-mono font-bold mb-2">Catalog Suggestions</p>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-8">Related Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/products/${p.id}`)}
                className="group bg-zinc-950/40 rounded-2xl border border-zinc-900 hover:border-amber-500/20 text-left cursor-pointer overflow-hidden transition-all duration-300"
              >
                <div className="w-full h-44 bg-zinc-950 overflow-hidden flex items-center justify-center p-4">
                  <img src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-[9px] text-amber-500 font-mono uppercase tracking-widest">{p.brand}</span>
                  <h3 className="font-display font-bold text-sm text-zinc-200 group-hover:text-amber-500 truncate mt-1">
                    {p.name}
                  </h3>
                  <p className="text-sm text-amber-500 font-black mt-1 font-mono">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FULLSCREEN LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {/* Slider frame */}
            <div className="w-full max-w-4xl aspect-video flex items-center justify-between relative p-8">
              
              <button
                onClick={() => {
                  const idx = modalImageIndex === 0 ? product.images.length - 1 : modalImageIndex - 1;
                  setModalImageIndex(idx);
                }}
                className="p-3 bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white rounded-full transition-colors"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 h-full flex items-center justify-center p-4">
                <img
                  src={product.images[modalImageIndex]}
                  alt="fullscreen view"
                  className="max-h-full max-w-full object-contain rounded-lg"
                />
              </div>

              <button
                onClick={() => {
                  const idx = modalImageIndex === product.images.length - 1 ? 0 : modalImageIndex + 1;
                  setModalImageIndex(idx);
                }}
                className="p-3 bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-white rounded-full transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Modal thumbnails selection indicator */}
            <div className="flex gap-3 mt-6">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setModalImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border p-1 bg-zinc-950 flex items-center justify-center transition-all ${
                    modalImageIndex === idx ? 'border-amber-400 scale-105' : 'border-zinc-800 opacity-50'
                  }`}
                >
                  <img src={img} alt="thumb" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
