'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="relative bg-[#060606] border-t border-white/5 mt-auto">
      {/* top neon line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-gold/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-5">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-gold flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.35)]">
                <Sparkles size={16} className="text-black" />
              </div>
              <span className="font-display font-black text-base tracking-wider text-white">
                BUJJI <span className="text-primary-gold">CELLULARS</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
              India's premier luxury mobile destination. 24K gold-plated devices, expert repairs, and gold-tier service — crafted for the extraordinary.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3 pt-2">
              {[
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  ),
                  href: '#',
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  ),
                  href: '#',
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                      <polygon points="9.7 15 9.7 9 14.5 12 9.7 15" />
                    </svg>
                  ),
                  href: '#',
                },
              ].map(({ icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-8 h-8 rounded-full border border-white/8 bg-white/3 flex items-center justify-center text-zinc-500 hover:text-primary-gold hover:border-primary-gold/40 hover:bg-primary-gold/8 transition-all"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-gold mb-5">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '/products' },
                { label: 'Smartphones', href: '/products?category=smartphones' },
                { label: 'AeroBuds & Audio', href: '/products?category=audio' },
                { label: 'Power & Chargers', href: '/products?category=power-chargers' },
                { label: 'Cyber Cases', href: '/products?category=protection' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-zinc-500 hover:text-white transition-colors hover:pl-1 transition-all duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-gold mb-5">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'Repair Services', href: '/repair-requests' },
                { label: 'Help Center', href: '/support' },
                { label: 'Track Your Order', href: '/orders' },
                { label: 'Careers', href: '/jobs' },
                { label: 'Contact Us', href: '/support' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-xs text-zinc-500 hover:text-white transition-colors hover:pl-1 transition-all duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary-gold mb-5">Stay in the Loop</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                VIP access to flash sales, new drops & exclusive launches.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-white/4 border border-white/8 text-xs px-4 py-2.5 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-primary-gold/50 transition-colors"
                />
                <button
                  type="submit"
                  className="btn-gold text-xs py-2.5 rounded-xl font-bold w-full"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { icon: <Mail size={12} />, text: 'hello@bujjicellulars.in' },
                { icon: <Phone size={12} />, text: '+91 98765 43210' },
                { icon: <MapPin size={12} />, text: 'Hyderabad, Telangana, India' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[11px] text-zinc-600">
                  <span className="text-primary-gold/70">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
            © {new Date().getFullYear()} Bujji Cellulars. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Use', 'Cookie Preferences'].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-[10px] text-zinc-600 hover:text-zinc-400 tracking-wider uppercase transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
