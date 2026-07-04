import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ToastContainer } from '@/components/common/Toast';
import CartDrawer from '@/components/cart/CartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bujji Cellulars | Premium E-Commerce Mobile Tech & Accessories',
  description: 'Welcome to Bujji Cellulars. Explore our futuristic, premium 24K gold-plated smartphones, high-fidelity earbuds, heavy-duty protective bumpers, and dynamic charging accessories. Built for elite performance.',
  keywords: 'Bujji Cellulars, premium smartphones, gold smartphones, mobile accessories, Aerobuds, luxury electronics, 3D smartphone viewer',
  openGraph: {
    title: 'Bujji Cellulars | Premium Futuristic E-Commerce',
    description: 'High-end mobile accessories and futuristic tech, engineered for luxury performance.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} site-bg text-foreground antialiased min-h-screen flex flex-col relative`}
      >
        {/* Dot grid overlay */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        
        <Navbar />
        <main className="flex-1 w-full relative z-10">{children}</main>
        <Footer />
        
        {/* Overlays & Alerts */}
        <CartDrawer />
        <ToastContainer />
      </body>
    </html>
  );
}
