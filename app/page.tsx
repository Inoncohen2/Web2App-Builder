
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Layers, Bell, Shield, Menu, X, 
  PlayCircle, Sparkles, Rocket, Code2, Cpu
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/AuthModal';
import { UserMenu } from '../components/UserMenu';
import { supabase } from '../supabaseClient';
import axios from 'axios';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check User Auth
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter your website URL');
      return;
    }

    // URL Validation Regex
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

    if (!urlPattern.test(url)) {
      setError('Please enter a valid URL (e.g. myshop.com)');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/scrape', { url });
      
      const params = new URLSearchParams();
      params.set('url', data.url || (url.startsWith('http') ? url : `https://${url}`));
      
      if (data.title) params.set('name', data.title);
      if (data.themeColor) params.set('color', data.themeColor);
      if (data.icon) params.set('icon', data.icon);

      router.push(`/builder?${params.toString()}`);
    } catch (error) {
      console.error('Analysis failed, proceeding with raw URL');
      const params = new URLSearchParams();
      params.set('url', url);
      router.push(`/builder?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#02040a] text-white selection:bg-cyan-500 selection:text-black font-sans overflow-x-hidden">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* --- COSMIC BACKGROUND SYSTEM --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Space Base */}
        <div className="absolute inset-0 bg-[#02040a]"></div>
        
        {/* Star Field (Simulated with noise) */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        
        {/* The Nebula / Horizon Glow - Center Stage */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-blue-600/20 blur-[120px] rounded-[100%]"></div>
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[80vw] h-[40vh] bg-cyan-500/10 blur-[100px] rounded-[100%]"></div>
        
        {/* Digital Grid Floor */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[50vh] opacity-20"
          style={{
            background: 'linear-gradient(transparent 0%, #06b6d4 2px, transparent 3px), linear-gradient(90deg, transparent 0%, #06b6d4 2px, transparent 3px)',
            backgroundSize: '100px 100px',
            transform: 'perspective(500px) rotateX(60deg) translateY(200px) scale(2)',
            maskImage: 'linear-gradient(to bottom, transparent, black)'
          }}
        ></div>

        {/* Floating Geometric Circuit Accents */}
        <div className="absolute top-20 left-10 w-64 h-64 border border-cyan-500/10 rounded-full opacity-20 animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 border border-purple-500/10 rounded-full opacity-20 animate-[spin_40s_linear_infinite_reverse]"></div>
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#02040a]/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-md opacity-50 rounded-lg group-hover:opacity-100 transition-opacity"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
                alt="Logo" 
                className="relative h-9 w-9 rounded-lg border border-white/20"
              />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Web2App</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            
            {user ? (
               <UserMenu />
            ) : (
               <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   className="text-slate-300 hover:text-white hover:bg-white/5" 
                   onClick={() => setIsAuthModalOpen(true)}
                 >
                   Log in
                 </Button>
                 <Button 
                   className="bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900/50 hover:border-cyan-400 rounded-full px-5 h-9 font-bold shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]" 
                   onClick={() => setIsAuthModalOpen(true)}
                 >
                   Sign Up
                 </Button>
               </div>
            )}
          </nav>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-32 pb-32 px-6 flex flex-col items-center justify-center min-h-[90vh]">
        
        {/* Headline Group */}
        <div className="text-center max-w-4xl mx-auto mb-12 relative">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-medium mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={12} />
              <span>Next Gen App Builder</span>
           </div>
           
           <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1] animate-in fade-in zoom-in duration-1000 delay-100">
              Turn your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">Site</span>
              <br /> into an <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">App</span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              The futuristic engine that converts any website into a high-performance native mobile app in seconds.
           </p>
        </div>

        {/* --- THE CARD INTERFACE --- */}
        <div className="w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
           {/* Glow Effects behind card */}
           <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-[2.5rem] blur opacity-30 animate-pulse"></div>
           
           <div className="relative bg-[#0b101b]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-[0_0_60px_-15px_rgba(6,182,212,0.2)]">
              
              {/* Card Header decoration */}
              <div className="flex justify-between items-center mb-6 opacity-50">
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                 </div>
                 <div className="text-[10px] font-mono text-cyan-500">SYSTEM.READY</div>
              </div>

              <form onSubmit={handleStart} className="space-y-6">
                 {/* Input Field */}
                 <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-600/50 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center bg-[#05080f] border border-white/10 rounded-full p-1.5 transition-colors group-focus-within:border-cyan-500/50">
                       <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-cyan-400">
                          <Globe size={18} />
                       </div>
                       <input 
                          value={url}
                          onChange={(e) => {
                             setUrl(e.target.value);
                             if(error) setError('');
                          }}
                          placeholder="https://yourwebsite.com"
                          className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-4 h-10 outline-none w-full font-mono text-sm"
                       />
                    </div>
                 </div>

                 {error && (
                    <div className="text-red-400 text-xs font-mono text-center bg-red-900/20 py-1 rounded border border-red-500/20">
                       [ERROR]: {error}
                    </div>
                 )}

                 {/* Main CTA Button */}
                 <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full group relative h-14 rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 group-hover:from-cyan-500 group-hover:via-blue-500 group-hover:to-purple-500 transition-colors"></div>
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite]"></div>
                    
                    <div className="relative flex items-center justify-center gap-2 text-white font-bold tracking-wide h-full">
                       {isLoading ? (
                          <Loader2 className="animate-spin" />
                       ) : (
                          <>
                             <Rocket className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" size={20} />
                             <span>INITIALIZE BUILDER</span>
                          </>
                       )}
                    </div>
                 </button>

                 <div className="text-center">
                    <button type="button" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors flex items-center justify-center gap-1 mx-auto">
                       <PlayCircle size={12} /> Watch the demo
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 relative z-10 border-t border-white/5 bg-[#02040a]/50 backdrop-blur-sm">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Core Systems</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">Engineered for performance, security, and native functionality.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {[
                  { icon: Layers, title: "Native Navigation", desc: "Inject genuine iOS/Android tab bars and headers overlaying your web content.", color: "cyan" },
                  { icon: Bell, title: "Push Protocol", desc: "Direct communication channel to user devices with unlimited notifications.", color: "purple" },
                  { icon: Shield, title: "Secure Shell", desc: "Enterprise-grade biometrics and SSL encryption wrapper.", color: "emerald" },
                  { icon: Zap, title: "Zero Latency", desc: "Optimized web-view rendering engine for near-native performance.", color: "yellow" },
                  { icon: Smartphone, title: "Universal Binary", desc: "Generate APK (Android) and IPA (iOS) from a single source configuration.", color: "blue" },
                  { icon: Cpu, title: "Offline Cache", desc: "Intelligent asset caching allows your app to function without signal.", color: "red" },
               ].map((feature, idx) => (
                  <div key={idx} className="group p-8 rounded-2xl bg-[#0b101b] border border-white/5 hover:border-white/10 hover:bg-[#131b2e] transition-all relative overflow-hidden">
                     <div className={`absolute top-0 right-0 p-32 bg-${feature.color}-500/5 blur-[80px] rounded-full group-hover:bg-${feature.color}-500/10 transition-colors`}></div>
                     <feature.icon className={`w-10 h-10 mb-6 text-${feature.color}-400 relative z-10`} />
                     <h3 className="text-xl font-bold text-white mb-3 relative z-10">{feature.title}</h3>
                     <p className="text-slate-400 text-sm leading-relaxed relative z-10">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section id="how-it-works" className="py-32 px-6 relative z-10">
         <div className="max-w-5xl mx-auto">
            <div className="relative border-l border-white/10 ml-4 md:ml-10 space-y-16">
               {[
                  { step: "01", title: "Input Source", desc: "Feed the engine your URL. Our scraper extracts metadata and assets instantly." },
                  { step: "02", title: "Configure Interface", desc: "Use the visual builder to set up native navigation, branding, and permissions." },
                  { step: "03", title: "Compile & Deploy", desc: "One-click build generation. Download your binary packages ready for store upload." }
               ].map((item, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-16 group">
                     <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
                     <div className="flex flex-col md:flex-row gap-4 md:gap-10 md:items-start">
                        <span className="text-4xl font-bold text-white/10 font-mono select-none">{item.step}</span>
                        <div>
                           <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                           <p className="text-slate-400">{item.desc}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-20 px-6 relative z-10">
         <div className="max-w-4xl mx-auto rounded-[3rem] p-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600">
            <div className="bg-[#05080f] rounded-[2.9rem] py-20 px-6 text-center relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-[100px] pointer-events-none"></div>
               
               <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white relative z-10">System Ready.</h2>
               <p className="text-lg text-slate-400 mb-10 max-w-lg mx-auto relative z-10">
                  Join the next generation of app creators. No code required.
               </p>
               
               <div className="relative z-10">
                  <Button 
                    onClick={() => document.querySelector('input')?.focus()}
                    className="h-14 px-10 text-lg bg-white text-black hover:bg-cyan-50 rounded-full font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-transform hover:scale-105"
                  >
                    Start Building
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-[#02040a] relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <div className="h-6 w-6 rounded bg-gradient-to-tr from-cyan-500 to-blue-600"></div>
               <span>Web2App</span>
            </div>
            <div className="text-sm text-slate-600">
               © 2024 Web2App Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
               <a href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</a>
               <a href="/terms" className="hover:text-cyan-400 transition-colors">Terms</a>
               <a href="/contact" className="hover:text-cyan-400 transition-colors">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
