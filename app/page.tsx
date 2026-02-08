'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Layers, Bell, Shield, Menu, X, 
  LayoutGrid, ShoppingBag, User, Home, Search,
  AlertCircle, Wifi
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

    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
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
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Background with Grid */}
      <div className="fixed inset-0 z-0 bg-grid-pattern pointer-events-none opacity-40"></div>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
                alt="Logo" 
                className="h-6 w-6 rounded-md"
              />
            </div>
            <span className="font-bold text-lg tracking-tight">Web2App</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            
            {user ? (
               <UserMenu />
            ) : (
               <div className="flex items-center gap-3 ml-4">
                 <Button 
                   variant="ghost" 
                   size="sm"
                   className="text-white" 
                   onClick={() => setIsAuthModalOpen(true)}
                 >
                   Log in
                 </Button>
                 <Button 
                   size="sm"
                   variant="primary"
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

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-zinc-300">Live App Engine V2.0</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent pb-2">
            Turn your website <br/>
            into a mobile app.
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
            Stop spending months on mobile development. 
            Enter your URL, customize your design, and publish to the App Store & Google Play today.
          </p>

          <form onSubmit={handleStart} className="w-full max-w-lg relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/0 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-full p-1.5 shadow-2xl transition-all focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600">
              <Globe className={`ml-4 ${error ? 'text-red-400' : 'text-zinc-500'}`} size={20} />
              <input 
                type="text" 
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError('');
                }}
                placeholder="https://yourwebsite.com"
                className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:ring-0 px-4 py-3 outline-none w-full text-base"
              />
              <Button 
                type="submit" 
                className="rounded-full px-8 h-12"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
              </Button>
            </div>
            
            {error && (
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                 <AlertCircle size={14} /> {error}
              </div>
            )}
          </form>

          <div className="mt-8 flex items-center gap-6 text-sm text-zinc-500">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-zinc-300" /> Free preview</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-zinc-300" /> No credit card</span>
          </div>

        </div>
      </section>

      {/* Feature Grid - Expo Style */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="col-span-1 md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700"></div>
              <div className="relative z-10">
                 <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center mb-6">
                    <Layers size={24} />
                 </div>
                 <h3 className="text-2xl font-bold mb-3">Native Navigation</h3>
                 <p className="text-zinc-400 max-w-md">Add a real native tab bar or bottom navigation to your web app. It feels just like a coded native app, not a browser wrapper.</p>
              </div>
              {/* Mockup UI */}
              <div className="mt-10 flex gap-4 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                 <div className="h-16 w-32 rounded-lg bg-zinc-800 border border-zinc-700"></div>
                 <div className="h-16 w-32 rounded-lg bg-zinc-800 border border-zinc-700"></div>
                 <div className="h-16 w-32 rounded-lg bg-zinc-800 border border-zinc-700"></div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-span-1 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
               <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-zinc-900 to-transparent opacity-50"></div>
               <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-800 text-white flex items-center justify-center mb-6 border border-zinc-700">
                     <Bell size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Push Notifications</h3>
                  <p className="text-zinc-400 text-sm">Engage users with unlimited native push notifications directly to their device.</p>
               </div>
            </div>

             {/* Card 3 */}
             <div className="col-span-1 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-800 text-white flex items-center justify-center mb-6 border border-zinc-700">
                     <Wifi size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Offline Ready</h3>
                  <p className="text-zinc-400 text-sm">Cache assets automatically so your app works perfectly even with spotty connections.</p>
               </div>
            </div>

            {/* Card 4 */}
            <div className="col-span-1 md:col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/20 p-8 backdrop-blur-sm relative overflow-hidden group">
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="flex-1">
                    <div className="h-12 w-12 rounded-2xl bg-white text-black flex items-center justify-center mb-6">
                       <Shield size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Enterprise Security</h3>
                    <p className="text-zinc-400">Biometric authentication ready, SSL encryption, and secure data handling standards compliant.</p>
                 </div>
                 <div className="w-full md:w-1/3">
                    <div className="rounded-xl bg-black border border-zinc-800 p-4">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-8 w-8 rounded-full bg-zinc-800"></div>
                          <div className="h-2 w-20 bg-zinc-800 rounded"></div>
                       </div>
                       <div className="space-y-2">
                          <div className="h-2 w-full bg-zinc-800 rounded"></div>
                          <div className="h-2 w-2/3 bg-zinc-800 rounded"></div>
                       </div>
                       <div className="mt-4 h-8 w-full bg-white rounded-md"></div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
               <div className="h-6 w-6 bg-white rounded-md"></div>
               <span>Web2App</span>
            </div>
            <div className="text-sm text-zinc-500">
               © 2024 Web2App Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-zinc-400">
               <a href="/privacy" className="hover:text-white">Privacy</a>
               <a href="/terms" className="hover:text-white">Terms</a>
               <a href="/contact" className="hover:text-white">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}