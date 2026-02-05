'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Globe, Loader2, Sparkles, Smartphone, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import axios from 'axios';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);

    try {
      // Call our scraping API
      const { data } = await axios.post('/api/scrape', { url });
      
      // Construct query parameters
      const params = new URLSearchParams();
      params.set('url', data.url || (url.startsWith('http') ? url : `https://${url}`));
      
      if (data.title) params.set('name', data.title);
      if (data.themeColor) params.set('color', data.themeColor);
      if (data.icon) params.set('icon', data.icon);

      // Redirect to builder
      router.push(`/builder?${params.toString()}`);
      
    } catch (error) {
      console.error('Analysis failed, proceeding with raw URL');
      // Fallback: just pass the URL entered by the user
      const params = new URLSearchParams();
      params.set('url', url);
      router.push(`/builder?${params.toString()}`);
    } finally {
      // Intentionally not setting loading to false here to prevent UI flash before redirect
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-900/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <Sparkles size={18} className="text-white" />
            </div>
            <span>Web2App</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm text-slate-300">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Login</a>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto mt-[-4rem]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Now supporting iOS 17 & Android 14
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
            Turn Your Website into a<br />
            Native App in Minutes.
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
            The only platform with <span className="text-white font-semibold">Instant Over-The-Air Updates</span>. 
            We build the APK once (takes ~15 mins), and forever after, any change on your website 
            updates the app instantly without store reviews.
          </p>

          <form onSubmit={handleStart} className="w-full max-w-md relative animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-lg p-2 shadow-2xl">
                <Globe className="ml-3 text-slate-500" size={20} />
                <input 
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter your website URL..."
                  className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-3 py-2 outline-none"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-none"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span className="flex items-center">Start <ArrowRight size={16} className="ml-1"/></span>}
                </Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              No credit card required • Free preview
            </p>
          </form>
        </main>

        {/* Feature Grid */}
        <div className="max-w-6xl mx-auto w-full px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Smartphone size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Native Navigation</h3>
            <p className="text-slate-400 text-sm">Real native bottom tabs and headers that feel just like a coded app.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <Zap size={20} />
            </div>
            <h3 className="font-semibold text-lg mb-2">Push Notifications</h3>
            <p className="text-slate-400 text-sm">Engage users with unlimited push notifications connected to your site.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:bg-white/10 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
              <RefreshCwIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2">OTA Updates</h3>
            <p className="text-slate-400 text-sm">Update your web content? Your app updates instantly. No app store waiting.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCwIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}