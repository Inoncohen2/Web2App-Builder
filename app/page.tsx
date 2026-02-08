
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Layers, Bell, Shield, Menu, X, 
  PlayCircle, Sparkles, Rocket, Code2, Cpu, ArrowUpRight, Megaphone
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

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter your website URL');
      return;
    }

    // URL Validation
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i');

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
    <div className="min-h-screen w-full bg-black text-white font-sans selection:bg-white/20">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* --- DOT GRID BACKGROUND --- */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' // Keeps dots cleaner at top
        }}
      ></div>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Left: Logo Area */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/')}>
                {/* Minimalist Triangle Logo */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                   <path d="M12 2L2 22h20L12 2zm0 3.8L18.2 20H5.8L12 5.8z" /> 
                </svg>
                <span className="font-bold text-lg tracking-tight">Expo</span>
             </div>
             <span className="text-slate-600 text-lg font-light">/</span>
             <span className="font-medium text-slate-200">Launch</span>
             <span className="px-2 py-0.5 rounded-full bg-emerald-900/30 text-emerald-400 text-[10px] font-bold tracking-wide border border-emerald-900/50">Beta</span>
          </div>

          {/* Right: Link */}
          <div className="flex items-center gap-6">
             <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
               {user ? <UserMenu /> : (
                 <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-white transition-colors">Log In</button>
               )}
             </nav>
             <a 
               href="#" 
               className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1"
             >
               expo.dev <ArrowUpRight size={14} />
             </a>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* Announcement Pill */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] border border-[#1f2937] hover:border-[#374151] transition-colors cursor-pointer group">
              <Megaphone size={14} className="text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Introducing Expo Launch:</span>
              <span className="text-slate-400 text-sm group-hover:text-slate-300">read the announcement</span>
           </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto mb-10">
           <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-[1.05] mb-2">
              <span className="block text-white">Launch anything</span>
              {/* Gradient text fading to dark */}
              <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 pb-2">to the App Store</span>
           </h1>
           
           <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mt-8 font-light">
              Shipping apps should be the easy part. Launch makes it easy by guiding you through the technical stuff, so your app can be in real users' hands. No config or prior knowledge needed.
           </p>
        </div>

        {/* Input Interface - Minimalist */}
        <div className="w-full max-w-lg mx-auto relative animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <form onSubmit={handleStart} className="relative group">
                {/* Subtle glow on focus */}
                <div className="absolute inset-0 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                
                <div className="relative flex items-center bg-[#0a0a0a] border border-[#333] rounded-full p-1.5 pl-6 transition-all focus-within:border-[#666] shadow-2xl">
                    <Globe size={18} className="text-slate-500 mr-3" />
                    <input 
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            if(error) setError('');
                        }}
                        placeholder="your-site.com"
                        className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 h-10 outline-none font-mono text-sm"
                    />
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="h-10 px-6 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <span>Start</span>}
                    </button>
                </div>
            </form>
            {error && (
                <div className="text-red-500 text-xs text-center mt-4 font-mono">
                    [ERROR]: {error}
                </div>
            )}
        </div>

      </section>

      {/* --- FEATURES GRID (Restyled to minimal) --- */}
      <section id="features" className="py-24 px-6 relative z-10 border-t border-white/5 bg-black">
         <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
               {[
                  { title: "Native Navigation", desc: "Genuine iOS/Android tab bars and headers overlaying your web content." },
                  { title: "Push Protocol", desc: "Direct communication channel to user devices with unlimited notifications." },
                  { title: "Universal Binary", desc: "Generate APK (Android) and IPA (iOS) from a single source configuration." },
               ].map((feature, idx) => (
                  <div key={idx} className="group">
                     <h3 className="text-xl font-bold text-white mb-3 group-hover:text-slate-200 transition-colors">{feature.title}</h3>
                     <p className="text-slate-500 text-base leading-relaxed font-light">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <span>Web2App</span>
            </div>
            <div className="text-sm text-slate-600">
               © 2024 Web2App Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
               <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
               <a href="/terms" className="hover:text-white transition-colors">Terms</a>
               <a href="/contact" className="hover:text-white transition-colors">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
