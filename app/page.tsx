
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Layers, Bell, Shield, ArrowUpRight, 
  Menu, X, PlayCircle, LayoutGrid, ShoppingBag, User, Home, Search,
  AlertCircle, Wifi, WifiOff
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
  
  // Animation State
  const [isAppMode, setIsAppMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // For Tab Animation demo

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

  // Cycle animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAppMode(prev => !prev);
    }, 4000); // Switch every 4 seconds
    return () => clearInterval(interval);
  }, []);

  // Tab Switching Animation Loop for Feature Demo
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab(prev => (prev + 1) % 3);
    }, 1500); 
    return () => clearInterval(interval);
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
    <div className="min-h-screen w-full bg-[#0B0F17] text-white selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
           // Optional: Redirect to dashboard if they logged in from header
           // router.push('/dashboard'); 
        }}
      />

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
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => router.push('/')}>
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            
            {user ? (
               <UserMenu />
            ) : (
               <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   className="text-white hover:bg-white/10" 
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

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0B0F17] border-b border-white/10 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl">
            <a href="#features" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#pricing" className="text-slate-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            {user ? (
               <div className="py-2 border-t border-white/10 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                        {user.email[0].toUpperCase()}
                     </div>
                     <span className="text-white">{user.email}</span>
                  </div>
                  <Button 
                    className="w-full bg-red-900/50 text-red-200 border border-red-900" 
                    onClick={async () => {
                       await supabase.auth.signOut();
                       setMobileMenuOpen(false);
                    }}
                  >
                    Log Out
                  </Button>
               </div>
            ) : (
              <Button className="w-full bg-indigo-600" onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}>Login / Sign Up</Button>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Hero Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left z-20">
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
              <div className={`relative flex items-center bg-[#131722] border rounded-xl p-2 shadow-2xl transition-colors ${error ? 'border-red-500/50' : 'border-white/10'}`}>
                <Globe className={`ml-3 ${error ? 'text-red-400' : 'text-slate-500'}`} size={20} />
                <input 
                  id="hero-input"
                  type="text" 
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="example.com"
                  className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-3 py-3 outline-none w-full"
                  // required - removed to handle custom validation
                />
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg h-10 px-6 font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                </Button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                   <AlertCircle size={14} /> {error}
                </div>
              )}

              <p className="mt-3 text-xs text-slate-500 flex items-center gap-2 justify-center lg:justify-start">
                <CheckCircle2 size={12} className="text-green-500" /> Free to try
                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                <CheckCircle2 size={12} className="text-green-500" /> No credit card
              </p>
            </form>
          </div>

          {/* TRANSFORMATION ANIMATION MOCKUP */}
          <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0 z-10">
            
            {/* The Morphing Device */}
            <div 
              className={`
                relative bg-white shadow-2xl transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-gray-900 overflow-hidden
                ${isAppMode 
                  ? 'w-[280px] h-[550px] rounded-[3rem] border-[8px]' // Phone State
                  : 'w-[520px] h-[350px] rounded-xl border-[1px] translate-y-8' // Browser State
                }
              `}
            >
               {/* 1. Header Transition */}
               <div className={`
                 w-full transition-all duration-1000 flex items-center px-4 relative z-20
                 ${isAppMode ? 'h-24 bg-indigo-600 pt-8 items-end text-white' : 'h-10 bg-gray-100 border-b border-gray-200'}
               `}>
                 
                 {/* Browser Elements (Hide in App Mode) */}
                 <div className={`flex items-center gap-2 w-full absolute top-1/2 -translate-y-1/2 left-4 transition-opacity duration-500 ${isAppMode ? 'opacity-0 delay-0' : 'opacity-100 delay-500'}`}>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 mx-4 h-6 bg-white border border-gray-200 rounded flex items-center px-2 text-[10px] text-gray-400">
                       <Globe size={10} className="mr-1" /> myshop.com
                    </div>
                 </div>

                 {/* App Elements (Show in App Mode) */}
                 <div className={`w-full flex justify-between items-center pb-2 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-2 delay-0'}`}>
                    <div className="font-bold text-lg">MyShop</div>
                    <div className="flex gap-3">
                       <Search size={18} />
                       <ShoppingBag size={18} />
                    </div>
                 </div>
               </div>

               {/* 2. Content Area */}
               <div className="bg-white w-full h-full p-4 relative overflow-hidden">
                  {/* Hero Banner inside device */}
                  <div className={`
                    bg-gray-100 rounded-lg mb-4 transition-all duration-1000 overflow-hidden relative
                    ${isAppMode ? 'h-40' : 'h-32'}
                  `}>
                     <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
                           <ShoppingBag size={24} />
                        </div>
                     </div>
                  </div>

                  {/* Product Grid Transition */}
                  <div className={`
                    grid gap-3 transition-all duration-1000
                    ${isAppMode ? 'grid-cols-1' : 'grid-cols-3'}
                  `}>
                     {[1, 2, 3].map((i) => (
                       <div key={i} className="space-y-2">
                          <div className="h-24 bg-gray-50 rounded-lg border border-gray-100"></div>
                          <div className="h-3 w-3/4 bg-gray-100 rounded"></div>
                          <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* 3. Bottom Navigation (Only in App Mode) */}
               <div className={`
                 absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around text-gray-400 transition-transform duration-700
                 ${isAppMode ? 'translate-y-0' : 'translate-y-full'}
               `}>
                  <div className="flex flex-col items-center gap-1 text-indigo-600">
                     <Home size={20} />
                     <span className="text-[10px] font-medium">Home</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <LayoutGrid size={20} />
                     <span className="text-[10px] font-medium">Cat.</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                     <User size={20} />
                     <span className="text-[10px] font-medium">Profile</span>
                  </div>
               </div>
            </div>

            {/* Labels floating around */}
            <div className={`absolute top-0 right-10 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-medium transition-all duration-500 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
               Native Navigation
            </div>
            
            <div className={`absolute bottom-20 -left-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-xs font-medium transition-all duration-500 delay-100 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
               Tab Bar
            </div>

            {/* Background Decor behind device */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
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

      {/* Bento Grid Features with ANIMATIONS */}
      <section id="features" className="py-24 px-6 bg-[#0B0F17]">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Everything you need</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-4 h-auto md:h-[600px]">
               
               {/* Feature 1: Large Box - NATIVE NAV ANIMATION */}
               <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-slate-900/50 border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative group">
                  <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                     <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                        <Layers size={24} />
                     </div>
                     <h3 className="text-2xl font-bold mb-2">Native Navigation Bar</h3>
                     <p className="text-slate-400">Add a real native tab bar or bottom navigation to your web app. It feels just like a coded native app, not a browser wrapper.</p>
                  </div>
                  {/* Visual representation - ANIMATED TABS */}
                  <div className="mt-8 bg-[#0F172A] rounded-t-xl border-t border-x border-white/10 p-4 pb-0 opacity-80 translate-y-4 group-hover:translate-y-2 transition-transform">
                     <div className="flex justify-between items-center text-slate-500 px-8 pb-4">
                        <div className={`flex flex-col items-center gap-1 transition-colors duration-500 ${activeTab === 0 ? 'text-indigo-400' : ''}`}>
                          <div className="h-5 w-5 bg-current rounded"></div>
                          <div className="h-2 w-8 bg-current rounded-full"></div>
                        </div>
                        <div className={`flex flex-col items-center gap-1 transition-colors duration-500 ${activeTab === 1 ? 'text-indigo-400' : 'opacity-50'}`}>
                          <div className="h-5 w-5 bg-current rounded"></div>
                          <div className="h-2 w-8 bg-current rounded-full"></div>
                        </div>
                        <div className={`flex flex-col items-center gap-1 transition-colors duration-500 ${activeTab === 2 ? 'text-indigo-400' : 'opacity-50'}`}>
                          <div className="h-5 w-5 bg-current rounded"></div>
                          <div className="h-2 w-8 bg-current rounded-full"></div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Feature 2: Push Notifications - BELL ANIMATION */}
               <div className="md:col-span-1 md:row-span-1 rounded-3xl bg-slate-900/50 border border-white/10 p-6 relative overflow-hidden group hover:border-white/20 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Bell size={100} />
                  </div>
                  <div className="relative z-10">
                     <div className="relative w-fit">
                       <Bell className="text-amber-400 mb-4 group-hover:animate-bounce origin-top" size={28} />
                       <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-[#0B0F17] animate-ping"></span>
                       <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-[#0B0F17]"></span>
                     </div>
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

               {/* Feature 4: Offline Mode - WIFI TOGGLE ANIMATION */}
               <div className="md:col-span-2 md:row-span-1 rounded-3xl bg-slate-900/50 border border-white/10 p-6 flex items-center justify-between group hover:border-white/20 transition-colors">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                        <h3 className="text-lg font-bold">Offline Support</h3>
                     </div>
                     <p className="text-sm text-slate-400 max-w-xs">Your app works even when the internet doesn't. Cache assets automatically.</p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center relative">
                     {/* Toggle between wifi on/off every few seconds via simple CSS animation or just show the icon */}
                     <div className="relative">
                        <WifiOff className="text-slate-500 absolute inset-0 animate-pulse opacity-50" size={24} />
                        <Wifi className="text-green-500 absolute inset-0 animate-ping opacity-30" size={24} />
                     </div>
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
                    className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-xl shadow-indigo-500/20"
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
               <a href="/privacy" className="hover:text-white">Privacy</a>
               <a href="/terms" className="hover:text-white">Terms</a>
               <a href="/contact" className="hover:text-white">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
