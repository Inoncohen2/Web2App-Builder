'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Layers, Bell, Shield, ArrowUpRight, 
  Menu, X, PlayCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import axios from 'axios';

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

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
    <div className="min-h-screen w-full bg-[#0B0F17] text-white selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute top-[40%] right-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B0F17]/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur opacity-50 rounded-lg"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
                alt="Logo" 
                className="relative h-9 w-9 rounded-lg"
              />
            </div>
            <span>Web2App</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.push('/login')}>Login</Button>
            <Button className="bg-white text-black hover:bg-slate-200 rounded-full px-6" onClick={() => document.getElementById('hero-input')?.focus()}>Get Started</Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0B0F17] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
            <a href="#features" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <Button className="w-full bg-indigo-600" onClick={() => setMobileMenuOpen(false)}>Get Started</Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Hero Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mx-auto lg:mx-0 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium text-emerald-300">Live App Generation Engine V2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              Convert your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Website to App</span>
              <br/> in seconds.
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop spending months and thousands of dollars on mobile development. 
              Paste your URL, customize your brand, and publish to the App Store & Google Play today.
            </p>

            <form onSubmit={handleStart} className="mt-4 relative max-w-md mx-auto lg:mx-0 w-full group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center bg-[#131722] border border-white/10 rounded-xl p-2 shadow-2xl">
                <Globe className="ml-3 text-slate-500" size={20} />
                <input 
                  id="hero-input"
                  type="text" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-3 py-3 outline-none w-full"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg h-10 px-6"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                </Button>
              </div>
              <p className="mt-3 text-xs text-slate-500 flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 size={12} className="text-green-500" /> Free to try
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <CheckCircle2 size={12} className="text-green-500" /> No credit card
              </p>
            </form>
          </div>

          {/* Hero Visual (3D Phone) */}
          <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0">
             <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl rotate-[-5deg] hover:rotate-0 transition-all duration-700 ease-out z-20 group">
                {/* Screen */}
                <div className="absolute inset-0 bg-[#0F172A] rounded-[2.5rem] overflow-hidden flex flex-col">
                   {/* Fake App Header */}
                   <div className="h-24 bg-indigo-600 p-6 pt-10 flex justify-between items-end">
                      <div className="h-6 w-6 rounded-md bg-white/20"></div>
                      <div className="h-4 w-24 rounded-full bg-white/20"></div>
                      <div className="h-6 w-6 rounded-full bg-white/20"></div>
                   </div>
                   {/* Fake Content */}
                   <div className="flex-1 p-4 space-y-4 bg-white relative">
                      <div className="h-32 rounded-xl bg-gray-100 w-full animate-pulse"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4">
                         <div className="h-24 bg-indigo-50 rounded-xl"></div>
                         <div className="h-24 bg-purple-50 rounded-xl"></div>
                      </div>
                      
                      {/* Floating Element */}
                      <div className="absolute bottom-6 left-4 right-4 h-14 bg-black/90 rounded-full flex items-center justify-around px-2 shadow-xl backdrop-blur-md">
                         <div className="h-8 w-8 rounded-full bg-white/20"></div>
                         <div className="h-8 w-8 rounded-full bg-indigo-500"></div>
                         <div className="h-8 w-8 rounded-full bg-white/20"></div>
                      </div>
                   </div>
                </div>
                {/* Reflection */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
             </div>
             
             {/* Decorative Background Elements behind phone */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[650px] border border-white/10 rounded-[4rem] rotate-[5deg] z-10"></div>
             <div className="absolute top-20 -right-10 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 z-30 animate-bounce shadow-lg" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Bell size={20} /></div>
                   <div className="text-xs">
                      <p className="font-bold">Push Notification</p>
                      <p className="text-slate-300">New sale started!</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Stats / Logos Section */}
      <div className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-center text-sm text-slate-500 mb-8 font-medium tracking-wide">TRUSTED BY MODERN BRANDS</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale">
             {/* Simple Text Placeholders for logos to keep it clean */}
             <span className="text-xl font-bold">SHOPIFY</span>
             <span className="text-xl font-bold">WORDPRESS</span>
             <span className="text-xl font-bold">WIX</span>
             <span className="text-xl font-bold">SQUARESPACE</span>
             <span className="text-xl font-bold">WEBFLOW</span>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-bold mb-4">From URL to App Store</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">Our automated engine handles the complexity of native app compilation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
               {/* Connecting Line (Desktop) */}
               <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 border-t border-dashed border-white/20 z-0"></div>

               {/* Step 1 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-2xl bg-[#131722] border border-white/10 flex items-center justify-center mb-6 shadow-xl group hover:border-indigo-500/50 transition-colors">
                     <Globe className="text-indigo-400 group-hover:scale-110 transition-transform" size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Paste URL</h3>
                  <p className="text-sm text-slate-400 px-6">Enter your website address. We scan your metadata, icon, and colors instantly.</p>
               </div>

               {/* Step 2 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-2xl bg-[#131722] border border-white/10 flex items-center justify-center mb-6 shadow-xl group hover:border-purple-500/50 transition-colors">
                     <Smartphone className="text-purple-400 group-hover:scale-110 transition-transform" size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Customize</h3>
                  <p className="text-sm text-slate-400 px-6">Configure native navigation, push notifications, and branding in our visual builder.</p>
               </div>

               {/* Step 3 */}
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-2xl bg-[#131722] border border-white/10 flex items-center justify-center mb-6 shadow-xl group hover:border-green-500/50 transition-colors">
                     <Zap className="text-green-400 group-hover:scale-110 transition-transform" size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Publish</h3>
                  <p className="text-sm text-slate-400 px-6">Download your APK/IPA files immediately and upload them to the stores.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 px-6 bg-[#0B0F17]">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Everything you need</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
               
               {/* Feature 1: Large Box */}
               <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                     <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                        <Layers size={24} />
                     </div>
                     <h3 className="text-2xl font-bold mb-2">Native Navigation Bar</h3>
                     <p className="text-slate-400">Add a real native tab bar or bottom navigation to your web app. It feels just like a coded native app, not a browser wrapper.</p>
                  </div>
                  {/* Visual representation */}
                  <div className="mt-8 bg-[#0F172A] rounded-t-xl border-t border-x border-white/10 p-4 pb-0 opacity-80 translate-y-4 group-hover:translate-y-2 transition-transform">
                     <div className="flex justify-between items-center text-slate-500 px-8 pb-4">
                        <div className="flex flex-col items-center gap-1 text-indigo-400"><div className="h-5 w-5 bg-current rounded"></div><div className="h-2 w-8 bg-current rounded-full"></div></div>
                        <div className="flex flex-col items-center gap-1"><div className="h-5 w-5 bg-current rounded opacity-50"></div><div className="h-2 w-8 bg-current rounded-full opacity-50"></div></div>
                        <div className="flex flex-col items-center gap-1"><div className="h-5 w-5 bg-current rounded opacity-50"></div><div className="h-2 w-8 bg-current rounded-full opacity-50"></div></div>
                     </div>
                  </div>
               </div>

               {/* Feature 2: Push Notifications */}
               <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-slate-900/50 border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Bell size={100} />
                  </div>
                  <div className="relative z-10">
                     <Bell className="text-amber-400 mb-4" size={28} />
                     <h3 className="text-lg font-bold mb-1">Push Notifications</h3>
                     <p className="text-sm text-slate-400">Unlimited notifications to engage users.</p>
                  </div>
               </div>

               {/* Feature 3: Security */}
               <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-slate-900/50 border border-white/10 p-6 group hover:border-white/20 transition-colors">
                  <Shield className="text-emerald-400 mb-4" size={28} />
                  <h3 className="text-lg font-bold mb-1">Enterprise Security</h3>
                  <p className="text-sm text-slate-400">Biometric auth ready and SSL encryption.</p>
               </div>

               {/* Feature 4: Offline Mode */}
               <div className="md:col-span-2 md:row-span-1 rounded-3xl bg-slate-900/50 border border-white/10 p-6 flex items-center justify-between group hover:border-white/20 transition-colors">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <h3 className="text-lg font-bold">Offline Support</h3>
                     </div>
                     <p className="text-sm text-slate-400 max-w-xs">Your app works even when the internet doesn't. Cache assets automatically.</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                     <Smartphone className="text-slate-400" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
         <div className="max-w-4xl mx-auto rounded-[3rem] bg-gradient-to-r from-indigo-600 to-purple-600 p-1">
            <div className="bg-[#0F172A] rounded-[2.9rem] py-16 px-6 text-center relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
               
               <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to launch?</h2>
               <p className="text-lg text-slate-300 mb-10 max-w-lg mx-auto relative z-10">
                  Join 10,000+ creators turning their websites into powerful mobile apps today.
               </p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                  <Button 
                    onClick={() => document.getElementById('hero-input')?.focus()}
                    className="h-14 px-8 text-lg bg-white text-black hover:bg-slate-200 rounded-full font-bold shadow-xl shadow-indigo-500/20"
                  >
                    Build my App Now
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-14 px-8 text-lg border-white/20 text-white hover:bg-white/10 rounded-full bg-transparent"
                  >
                    <PlayCircle className="mr-2" size={20} /> Watch Demo
                  </Button>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-[#05080F]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg">
               <div className="h-6 w-6 bg-indigo-600 rounded-md"></div>
               <span>Web2App</span>
            </div>
            <div className="text-sm text-slate-500">
               © 2024 Web2App Builder. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
               <a href="#" className="hover:text-white">Privacy</a>
               <a href="#" className="hover:text-white">Terms</a>
               <a href="#" className="hover:text-white">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}