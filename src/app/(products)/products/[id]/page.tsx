'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Shield, RefreshCw, Truck, Heart, ShoppingBag, Plus, Minus, Send, Check } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
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

  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedColor(product.colors[0]);
      setSelectedStorage(product.storage[0]);
      setReviewsList(product.reviews);
      setQaList(product.qa);
      setLoading(false);
    } else {
      // Simulate fetch delay or redirect
      const timer = setTimeout(() => {
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [product]);

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

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Side: Product Gallery & 3D Interactive Model Visualizer */}
        <div className="space-y-6">
          {/* Main Visualizer Container */}
          <div className="w-full aspect-square rounded-2xl ultra-glass border border-white/5 overflow-hidden flex items-center justify-center relative p-6">
            <img src={selectedImage} alt={product.name} className="max-h-full max-w-full object-contain rounded-lg" />
            <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur-sm border border-primary-gold/20 px-3 py-1 rounded-full text-[10px] text-primary-gold uppercase tracking-wider flex items-center space-x-1">
              <Check size={10} />
              <span>Rotates in 3D Mode</span>
            </div>
          </div>

          {/* Thumbnail list */}
          <div className="flex space-x-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border bg-white/3 flex items-center justify-center transition-all ${
                  selectedImage === img ? 'border-primary-gold scale-105' : 'border-white/6 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Specs & Buying parameters */}
        <div className="space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-primary-gold">{product.brand}</span>
            <h1 className="font-display font-black text-3xl text-white tracking-wide uppercase leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 pt-1">
              <div className="flex items-center space-x-1.5">
                <Star className="fill-primary-gold text-primary-gold" size={14} />
                <span className="text-xs font-semibold text-zinc-300">{product.rating}</span>
              </div>
              <span className="text-zinc-600">|</span>
              <span className="text-xs text-zinc-400 font-semibold">{reviewsList.length} Verified Reviews</span>
              <span className="text-zinc-650">|</span>
              <span className="text-xs text-emerald-400 font-semibold">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-4">
            <span className="text-2xl font-black text-primary-gold">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <span className="text-sm text-zinc-500 line-through font-semibold">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            )}
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-medium">{product.description}</p>

          <hr className="border-white/5" />

          {/* Buying Variants options */}
          <div className="space-y-6">
            {/* Color variants */}
            {product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Accent Finish</span>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border transition-all ${
                        selectedColor === color ? 'border-primary-gold scale-110 ring-2 ring-primary-gold/40' : 'border-zinc-800'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Storage/Model variants */}
            {product.storage.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Memory / Configuration</span>
                <div className="flex flex-wrap gap-2">
                  {product.storage.map((storage) => (
                    <button
                      key={storage}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 text-xs border rounded-lg transition-all ${
                        selectedStorage === storage
                          ? 'border-primary-gold bg-primary-gold/10 text-primary-gold font-bold'
                          : 'border-zinc-850 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Quantity</span>
              <div className="flex items-center space-x-4 bg-white/3 border border-white/8 rounded-full w-32 px-3 py-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-zinc-400 hover:text-white">
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-xs font-bold text-zinc-200">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-zinc-400 hover:text-white">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              className="btn-gold flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-wider"
              onClick={() => {
                addItem(product, quantity, selectedColor, selectedStorage);
                showToast(`Acquired ${quantity}x ${product.name}!`, 'success');
              }}
            >
              <ShoppingBag size={16} />
              Acquire & Add to Cart
            </button>
            <button
              className="btn-outline flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider shrink-0"
              onClick={() => {
                toggleWishlist(product.id);
                showToast(isWished ? 'Removed from wishlist' : 'Saved to wishlist', 'info');
              }}
            >
              <Heart size={16} className={isWished ? 'fill-red-500 text-red-500' : ''} />
              {isWished ? 'Saved' : 'Wishlist'}
            </button>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/5">
            <div className="flex items-center space-x-2.5">
              <Truck size={16} className="text-primary-gold" />
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Free Air Express</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <RefreshCw size={16} className="text-primary-gold" />
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">30-Day Escrow Returns</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Shield size={16} className="text-primary-gold" />
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Solid Plating Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Spec Comparison / Reviews / Q&A */}
      <div className="mt-20 border-t border-white/5 pt-10">
        <div className="flex border-b border-white/5 space-x-8 mb-8">
          {['specs', 'reviews', 'qa'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-4 text-xs font-semibold uppercase tracking-widest transition-colors relative ${
                activeTab === tab ? 'text-primary-gold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'specs' ? 'Model Specs' : tab === 'reviews' ? 'Reviews' : 'Q&A Forum'}
              {activeTab === tab && (
                <motion.div layoutId="detail-tab-line" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'specs' && (
            <div className="max-w-2xl space-y-4">
              <h3 className="font-display font-bold text-sm text-zinc-200 uppercase tracking-wider mb-4">Technical Details</h3>
              <div className="grid grid-cols-1 divide-y divide-white/5">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="py-3 flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium uppercase tracking-wider">{key}</span>
                    <span className="text-zinc-200 font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-6">
                {reviewsList.length === 0 ? (
                  <p className="text-xs text-zinc-500">No client reviews registered for this model yet.</p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider">{rev.author}</p>
                          <span className="text-[9px] text-zinc-500">{rev.date}</span>
                        </div>
                        <Rating value={rev.rating} readonly size={12} />
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add review form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleAddReview} className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-white">Submit Feedback</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">Rating</label>
                    <Rating value={newRating} onChange={setNewRating} readonly={false} size={16} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-500 uppercase font-semibold">Comment</label>
                    <textarea
                      required
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment on premium build..."
                      className="w-full bg-white/3 border border-white/8 text-xs px-3.5 py-2.5 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold transition-colors"
                    />
                  </div>
                  <button type="submit" className="btn-gold w-full py-3 text-xs font-bold uppercase tracking-wider">
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* QA thread list */}
              <div className="lg:col-span-2 space-y-6">
                {qaList.length === 0 ? (
                  <p className="text-xs text-zinc-500">No user queries posted yet.</p>
                ) : (
                  qaList.map((qa) => (
                    <div key={qa.id} className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-3">
                      <p className="text-xs font-bold text-white tracking-wide">Q: {qa.question}</p>
                      <p className="text-xs text-zinc-400 pl-4 border-l border-primary-gold/40">A: {qa.answer}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Question Form */}
              <div className="lg:col-span-1">
                <form onSubmit={handleAddQuestion} className="ultra-glass p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="font-display font-black text-sm uppercase text-white">Ask a Question</h4>
                  <textarea
                    required
                    rows={3}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask about design, specifications..."
                    className="w-full bg-white/3 border border-white/8 text-xs px-3.5 py-2.5 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-primary-gold transition-colors"
                  />
                  <button type="submit" className="btn-gold w-full py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <Send size={12} />
                    Submit Query
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-tight mb-8">Related Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => router.push(`/products/${p.id}`)}
                className="group ultra-glass rounded-2xl border border-white/5 hover:border-primary-gold/20 text-left cursor-pointer overflow-hidden transition-all duration-300"
              >
                <div className="w-full h-44 bg-zinc-900 overflow-hidden flex items-center justify-center">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <span className="text-[9px] text-primary-gold font-mono uppercase tracking-widest">{p.brand}</span>
                  <h3 className="font-display font-bold text-sm text-zinc-200 group-hover:text-primary-gold truncate mt-1">
                    {p.name}
                  </h3>
                  <p className="text-sm text-primary-gold font-black mt-1">₹{p.price.toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
