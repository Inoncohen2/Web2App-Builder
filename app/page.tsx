
import React from 'react';
import Image from 'next/image';
import { Zap } from 'lucide-react';

import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { SocialProof, NativeFeatures } from '../components/landing/Statics';
import { InteractiveTerminal, PipelineFlow, BridgeShowcase, AppTransformationDemo } from '../components/landing/Showcases';

// Set ISR Cache duration (1 hour)
export const revalidate = 3600;

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white selection:bg-white selection:text-black font-sans overflow-x-hidden flex flex-col">
      <Navbar />

      {/* Main Hero (Client Component handles input/splash) */}
      <Hero />

      {/* Static Sections (Server Rendered) */}
      <SocialProof />

      {/* Client Component for Transformation Animation */}
      <AppTransformationDemo />

      {/* Static Section */}
      <NativeFeatures />

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative bg-zinc-950 overflow-hidden border-t border-zinc-900 pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-32">
          {/* Client Components for Animations */}
          <InteractiveTerminal />

          <div className="flex flex-col items-center">
            <div className="text-center mb-10 md:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
                <Zap size={12} className="text-amber-400" /> INSTANT BUILD FACTORY
              </div>
              <h3 className="text-3xl md:text-5xl font-black text-white text-balance">
                From URL to Store.<br/>
                <span className="text-zinc-600">Complete automated flow.</span>
              </h3>
            </div>

            <PipelineFlow />
          </div>
        </div>
      </section>

      {/* Carousel */}
      <BridgeShowcase />

      {/* Footer (Static) */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto relative z-10 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
            <div className="h-6 w-6 relative">
              <Image 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                alt="Logo" 
                width={24} 
                height={24} 
                className="h-full w-full object-contain rounded-md" 
              />
            </div>
            <span>Web2App</span>
          </div>
          <div className="text-sm text-zinc-500">
            © 2024 Web2App Builder. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms</a>
            <a href="/contact" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
