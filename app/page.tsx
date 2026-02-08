
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
    <div className="min-h-screen w-full bg-black text-white font-sans overflow-x-hidden bg-dot-pattern selection:bg-white selection:text-black">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <img 
              src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
              alt="Logo" 
              className="h-8 w-8 rounded-lg border border-white/20"
            />
            <span className="text-white">Web2App</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            
            {user ? (
               <UserMenu />
            ) : (
               <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   className="text-gray-400 hover:text-white hover:bg-white/5" 
                   onClick={() => setIsAuthModalOpen(true)}
                 >
                   Log in
                 </Button>
                 <Button 
                   className="bg-white text-black hover:bg-gray-200 rounded-full px-5 h-9 font-bold" 
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
      <section className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-[85vh]">
        
        {/* Headline Group */}
        <div className="text-center max-w-5xl mx-auto mb-16 relative">
           
           {/* Badge */}
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span>Introducing Expo Launch</span>
              <ArrowRight size={10} className="ml-1" />
           </div>
           
           <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
              Turn your Site <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">into an App</span>
           </h1>
           
           <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Shipping apps should be the easy part. Web2App makes it easy by converting any website into a high-performance native mobile app in seconds.
           </p>
        </div>

        {/* --- INPUT INTERFACE --- */}
        <div className="w-full max-w-xl mx-auto relative z-20">
           <div className="relative">
              <form onSubmit={handleStart} className="flex flex-col gap-4">
                 <div className="relative group">
                    <div className="relative flex items-center bg-[#111] border border-white/10 rounded-full p-2 transition-all group-focus-within:border-white/30 group-focus-within:ring-1 group-focus-within:ring-white/20">
                       <div className="h-10 w-12 flex items-center justify-center text-gray-500 border-r border-white/10 mr-2">
                          <Globe size={20} />
                       </div>
                       <input 
                          value={url}
                          onChange={(e) => {
                             setUrl(e.target.value);
                             if(error) setError('');
                          }}
                          placeholder="https://yourwebsite.com"
                          className="flex-1 bg-transparent border-none text-white placeholder:text-gray-600 focus:ring-0 px-2 h-10 outline-none w-full font-mono text-sm"
                       />
                       <button 
                          type="submit"
                          disabled={isLoading}
                          className="h-10 px-6 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                       >
                          {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Launch"}
                       </button>
                    </div>
                 </div>

                 {error && (
                    <div className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1.5">
                       <Shield size={12} /> {error}
                    </div>
                 )}
              </form>
           </div>
        </div>

        {/* --- DEMO / PREVIEW --- */}
        <div className="mt-20 relative w-full max-w-6xl mx-auto">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 h-full w-full"></div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                 {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 rounded-xl border border-white/10 bg-[#0A0A0A] p-4 flex flex-col gap-2">
                        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
                        <div className="h-full bg-white/5 rounded-lg border border-white/5 border-dashed"></div>
                    </div>
                 ))}
             </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-32 px-6 relative z-10 border-t border-white/10">
         <div className="max-w-7xl mx-auto">
            <div className="mb-20">
               <span className="text-green-500 font-mono text-xs uppercase tracking-wider mb-2 block">Features</span>
               <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Core Systems</h2>
               <p className="text-gray-400 max-w-2xl text-lg">Everything you need to ship to the App Store and Play Store.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
               {[
                  { icon: Layers, title: "Native Navigation", desc: "Inject genuine iOS/Android tab bars and headers overlaying your web content." },
                  { icon: Bell, title: "Push Protocol", desc: "Direct communication channel to user devices with unlimited notifications." },
                  { icon: Shield, title: "Secure Shell", desc: "Enterprise-grade biometrics and SSL encryption wrapper." },
                  { icon: Zap, title: "Zero Latency", desc: "Optimized web-view rendering engine for near-native performance." },
                  { icon: Smartphone, title: "Universal Binary", desc: "Generate APK (Android) and IPA (iOS) from a single source configuration." },
                  { icon: Cpu, title: "Offline Cache", desc: "Intelligent asset caching allows your app to function without signal." },
               ].map((feature, idx) => (
                  <div key={idx} className="group">
                     <div className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-lg bg-white/5 text-white border border-white/10">
                        <feature.icon size={24} />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                     <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- HOW IT WORKS (Timeline) --- */}
      <section id="how-it-works" className="py-32 px-6 relative z-10 bg-[#050505]">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold">How it works</h2>
            </div>

            <div className="relative border-l border-white/10 ml-4 md:ml-0 space-y-16 md:space-y-0 md:grid md:grid-cols-3 md:gap-12 md:border-l-0">
               {[
                  { step: "01", title: "Input Source", desc: "Feed the engine your URL. Our scraper extracts metadata and assets instantly." },
                  { step: "02", title: "Configure", desc: "Use the visual builder to set up native navigation, branding, and permissions." },
                  { step: "03", title: "Compile", desc: "One-click build generation. Download your binary packages ready for store upload." }
               ].map((item, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-0 group">
                     <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-white md:hidden"></div>
                     <div className="flex flex-col gap-4">
                        <span className="text-6xl font-bold text-white/5 font-mono select-none -mb-4">{item.step}</span>
                        <div>
                           <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                           <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-32 px-6 relative z-10 text-center">
         <div className="max-w-4xl mx-auto">
             <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready to launch?</h2>
             <Button 
                onClick={() => document.querySelector('input')?.focus()}
                className="h-14 px-10 text-lg bg-white text-black hover:bg-gray-200 rounded-full font-bold"
              >
                Start Building
              </Button>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <span>Web2App</span>
            </div>
            <div className="text-sm text-gray-600">
               © 2024 Web2App Builder.
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
               <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
               <a href="/terms" className="hover:text-white transition-colors">Terms</a>
               <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
