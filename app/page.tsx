
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Menu, X, Search, ShoppingBag, User, Home, LayoutGrid,
  AlertCircle, Sparkles, Lock, Terminal, Code, Cpu, Layers, MousePointer2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/AuthModal';
import { UserMenu } from '../components/UserMenu';
import { supabase } from '../supabaseClient';
import axios from 'axios';

// --- SUB-COMPONENTS FOR DESIGNS ---

// Design 1: Sticky Narrative (Clean, High-end)
const StickyNarrative = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { title: "Input Source", desc: "Paste your website URL. Our engine scrapes assets, styles, and content structure instantly.", icon: Globe },
    { title: "Native Polish", desc: "We automatically configure native navigation, tab bars, and gestures that feel essentially mobile.", icon: Smartphone },
    { title: "Binary Build", desc: "Download signed APK/AAB files ready for Google Play Console upload in minutes.", icon: Zap },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
      {/* Left: Text Steps */}
      <div className="space-y-12">
        {steps.map((step, idx) => (
          <div 
            key={idx}
            className={`transition-all duration-500 cursor-pointer ${activeStep === idx ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-4'}`}
            onClick={() => setActiveStep(idx)}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className={`text-4xl font-black ${activeStep === idx ? 'text-white' : 'text-zinc-700'}`}>0{idx + 1}</span>
              <div className={`h-[1px] flex-1 ${activeStep === idx ? 'bg-white' : 'bg-zinc-800'}`}></div>
            </div>
            <h3 className={`text-3xl font-bold mb-2 ${activeStep === idx ? 'text-white' : 'text-zinc-500'}`}>{step.title}</h3>
            <p className="text-lg text-zinc-400 max-w-md">{step.desc}</p>
          </div>
        ))}
      </div>

      {/* Right: Dynamic Visual */}
      <div className="relative h-[600px] w-full bg-zinc-900/50 rounded-[3rem] border border-zinc-800 flex items-center justify-center p-8 overflow-hidden shadow-2xl">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {/* Phone Mockup */}
        <div className="relative z-10 w-[280px] h-[540px] bg-black border-[8px] border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden transition-all duration-700">
           
           {/* Screen Content based on Step */}
           <div className="absolute inset-0 bg-zinc-950 flex flex-col">
              {/* Header */}
              <div className="h-24 bg-zinc-900 border-b border-zinc-800 flex items-end pb-4 justify-center">
                 <div className="font-bold text-white">My App</div>
              </div>
              
              {/* Body */}
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                 {activeStep === 0 && (
                   <div className="animate-in zoom-in duration-500">
                      <div className="h-16 w-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                        <Globe size={32} />
                      </div>
                      <div className="text-sm font-mono text-blue-400">Scanning myshop.com...</div>
                      <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
                      </div>
                   </div>
                 )}
                 {activeStep === 1 && (
                   <div className="animate-in zoom-in duration-500 w-full space-y-3">
                      <div className="flex justify-between items-center text-xs text-zinc-500 uppercase font-bold tracking-wider mb-2">Native UI</div>
                      <div className="h-12 bg-zinc-800 rounded-lg w-full animate-pulse delay-75"></div>
                      <div className="h-32 bg-zinc-800 rounded-lg w-full animate-pulse delay-100"></div>
                      <div className="h-12 bg-zinc-800 rounded-lg w-full animate-pulse delay-150"></div>
                   </div>
                 )}
                 {activeStep === 2 && (
                   <div className="animate-in zoom-in duration-500">
                      <div className="h-20 w-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={40} />
                      </div>
                      <div className="text-xl font-bold text-white">Ready!</div>
                      <div className="text-xs text-zinc-500 mt-2">app-release.aab</div>
                   </div>
                 )}
              </div>

              {/* Tab Bar (Only on step 1 & 2) */}
              <div className={`h-16 border-t border-zinc-800 flex items-center justify-around text-zinc-600 transition-all duration-500 ${activeStep === 0 ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
                 <Home size={20} className={activeStep === 1 ? 'text-white' : ''} />
                 <Search size={20} />
                 <User size={20} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

// Design 2: Neon Pipeline (Futuristic, Dark)
const NeonPipeline = () => {
  return (
    <div className="relative py-12">
      {/* Background Pipeline Line */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-zinc-900 -translate-y-1/2">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent w-1/2 animate-[shimmer_3s_infinite_linear]"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {[
          { 
            title: "Inject URL", 
            icon: Search, 
            color: "text-blue-400", 
            bg: "shadow-[0_0_30px_-10px_rgba(96,165,250,0.3)] border-blue-500/30",
            desc: "System identifies manifest, meta tags, and assets." 
          },
          { 
            title: "Processing", 
            icon: Layers, 
            color: "text-purple-400", 
            bg: "shadow-[0_0_30px_-10px_rgba(192,132,252,0.3)] border-purple-500/30",
            desc: "WebView wrapper encapsulation with native bridges." 
          },
          { 
            title: "Compile", 
            icon: Cpu, 
            color: "text-emerald-400", 
            bg: "shadow-[0_0_30px_-10px_rgba(52,211,153,0.3)] border-emerald-500/30",
            desc: "Cloud build farm generates signed Android binaries." 
          },
        ].map((card, i) => (
          <div key={i} className={`group bg-black p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:bg-zinc-900 ${card.bg}`}>
             <div className="flex justify-between items-start mb-6">
               <div className={`p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 group-hover:scale-110 transition-transform duration-300 ${card.color}`}>
                 <card.icon size={28} />
               </div>
               <span className="text-4xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors">0{i+1}</span>
             </div>
             <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-all">{card.title}</h3>
             <p className="text-sm text-zinc-500 leading-relaxed">
               {card.desc}
             </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Design 3: Interactive Terminal (Dev-focused, Techy)
const InteractiveTerminal = () => {
  const [lines, setLines] = useState<string[]>([]);
  
  useEffect(() => {
    const sequence = [
      { text: "> initializing engine...", delay: 0 },
      { text: "> fetch https://myshop.com", delay: 800 },
      { text: "✔ analyzed 24 assets", delay: 1600 },
      { text: "✔ detected theme: #000000", delay: 2400 },
      { text: "> compiling native bridge...", delay: 3200 },
      { text: "✔ BUILD SUCCESSFUL (240ms)", delay: 4500 },
    ];

    let timeouts: any[] = [];
    
    // Reset and start loop
    const runSequence = () => {
      setLines([]);
      sequence.forEach(({ text, delay }) => {
        const timeout = setTimeout(() => {
          setLines(prev => [...prev, text]);
        }, delay);
        timeouts.push(timeout);
      });
    };

    runSequence();
    const interval = setInterval(runSequence, 6000); // Restart every 6s

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
       <div className="order-2 md:order-1">
          <div className="w-full bg-[#1e1e1e] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 font-mono text-sm relative">
             {/* Terminal Header */}
             <div className="bg-[#2d2d2d] px-4 py-2 flex gap-2 border-b border-zinc-800">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
               <div className="ml-auto text-xs text-zinc-500">web2app-cli — 80x24</div>
             </div>
             
             {/* Terminal Body */}
             <div className="p-6 h-[300px] flex flex-col text-zinc-300">
                {lines.map((line, i) => (
                  <div key={i} className={`mb-2 ${line.includes('✔') ? 'text-emerald-400' : ''} ${line.includes('>') ? 'text-zinc-400' : ''}`}>
                    {line}
                  </div>
                ))}
                <div className="animate-pulse">_</div>
             </div>
          </div>
       </div>

       <div className="order-1 md:order-2 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 text-xs font-mono mb-2">
            <Terminal size={14} /> NO CODE REQUIRED
          </div>
          <h3 className="text-4xl font-bold text-white tracking-tight">
            Developer power,<br />
            <span className="text-zinc-500">without the code.</span>
          </h3>
          <p className="text-lg text-zinc-400">
             We abstracted the entire React Native build pipeline into a simple URL input. What takes engineers weeks, takes our engine seconds.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-900 rounded-lg text-white"><Code size={20} /></div>
               <span className="text-sm text-zinc-400">Zero Config</span>
             </div>
             <div className="flex items-center gap-3">
               <div className="p-2 bg-zinc-900 rounded-lg text-white"><MousePointer2 size={20} /></div>
               <span className="text-sm text-zinc-400">1-Click Build</span>
             </div>
          </div>
       </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Design Selection State
  const [selectedDesign, setSelectedDesign] = useState<'sticky' | 'neon' | 'terminal'>('sticky');
  
  // Animation State
  const [isAppMode, setIsAppMode] = useState(false);

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
    <div className="min-h-screen w-full bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden flex flex-col">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
           // Optional: Redirect
        }}
      />

      {/* Dynamic Background - Dots Fading from Bottom to Top */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 
            Mask Image: Linear gradient from transparent (top) to black (bottom).
            This makes the dots visible only at the bottom near the planet and fade out upwards.
        */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:32px_32px] opacity-40 [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
      </div>

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
                alt="Logo" 
                className="relative h-9 w-9 rounded-lg grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            </div>
            <span className="text-white">Web2App</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            
            {user ? (
               <UserMenu />
            ) : (
               <div className="flex items-center gap-4">
                 <Button 
                   variant="ghost" 
                   className="text-zinc-400 hover:text-white hover:bg-white/5" 
                   onClick={() => setIsAuthModalOpen(true)}
                 >
                   Log in
                 </Button>
                 <Button 
                   className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-9 font-bold transition-all" 
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
          <div className="md:hidden absolute top-20 left-0 right-0 bg-black border-b border-zinc-800 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl">
            <a href="#how-it-works" className="text-zinc-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            {user ? (
               <div className="py-2 border-t border-zinc-800 mt-2">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
                        {user.email[0].toUpperCase()}
                     </div>
                     <span className="text-white">{user.email}</span>
                  </div>
                  <Button 
                    className="w-full bg-red-900/20 text-red-200 border border-red-900/50" 
                    onClick={async () => {
                       await supabase.auth.signOut();
                       setMobileMenuOpen(false);
                    }}
                  >
                    Log Out
                  </Button>
               </div>
            ) : (
              <Button className="w-full bg-white text-black" onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}>Login / Sign Up</Button>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-32 px-6 overflow-hidden flex-1 min-h-[90vh] flex flex-col justify-center">
        
        {/* THE PLANET HORIZON EFFECT */}
        <div className="absolute bottom-[-50px] left-1/2 -translate-x-1/2 translate-y-[40%] w-[200vw] aspect-square rounded-[100%] bg-black z-0 pointer-events-none shadow-[0_-120px_400px_rgba(16,185,129,0.35)] border-t border-emerald-500/30"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          
          {/* Hero Content */}
          <div className="flex flex-col gap-8 text-center lg:text-left z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 w-fit mx-auto lg:mx-0 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase tracking-wider">Live App Generation Engine V2.0</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-white">
              Convert your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500">Website to App</span>
              <br/> in seconds.
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0 font-light">
              Stop spending months and thousands of dollars on mobile development. 
              Paste your URL, customize your brand, and publish to the App Store & Google Play today.
            </p>

            {/* UPGRADED INPUT SECTION: THE DARK BROWSER */}
            <form onSubmit={handleStart} className="mt-6 relative max-w-lg mx-auto lg:mx-0 w-full group">
              
              {/* Browser Window Container */}
              <div className="relative bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-emerald-900/10 hover:border-emerald-500/20 overflow-hidden">
                
                {/* Browser Header / Controls */}
                <div className="flex items-center px-4 py-3 gap-2 border-b border-white/5 bg-white/[0.02]">
                   <div className="flex gap-2">
                     <div className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
                     <div className="h-3 w-3 rounded-full bg-[#febc2e] shadow-sm"></div>
                     <div className="h-3 w-3 rounded-full bg-[#28c840] shadow-sm"></div>
                   </div>
                   {/* Optional: URL Text mimic for aesthetics */}
                   <div className="ml-auto text-[10px] text-zinc-600 font-mono hidden sm:flex items-center gap-1">
                      <Lock size={10} />
                      <span>secure browser</span>
                   </div>
                </div>

                {/* Browser Content Area */}
                <div className="p-4">
                  <div className={`relative flex items-center bg-black border transition-all duration-300 rounded-xl overflow-hidden ${isInputFocused ? 'border-zinc-500 ring-1 ring-zinc-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}>
                    
                    {/* Icon Container */}
                    <div className="pl-4 pr-3 text-zinc-500 border-r border-white/5 h-8 flex items-center mr-2">
                      <Globe size={18} className={`${isInputFocused ? 'text-white' : ''} transition-colors duration-300`} />
                    </div>
                    
                    {/* Input */}
                    <input 
                      id="hero-input"
                      type="text" 
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        if (error) setError('');
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="myshop.com"
                      className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:ring-0 px-0 py-4 outline-none w-full text-base font-mono tracking-tight"
                    />
                    
                    {/* Action Button */}
                    <div className="pr-2 pl-2">
                      <Button 
                        type="submit" 
                        className="bg-white hover:bg-zinc-200 text-black rounded-lg h-10 px-5 font-bold shadow-lg shadow-white/5 transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0 text-sm"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin text-black" size={18} />
                        ) : (
                          <div className="flex items-center gap-2">
                             <span>BUILD</span>
                             <ArrowRight size={16} strokeWidth={3} />
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="absolute -bottom-10 left-0 flex items-center gap-2 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                   <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Trust Indicators */}
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-xs font-medium text-zinc-500">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                   <CheckCircle2 size={14} className="text-emerald-500" /> Free Preview
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                   <Sparkles size={14} className="text-indigo-400" /> No Code Required
                </span>
              </div>
            </form>
          </div>

          {/* TRANSFORMATION ANIMATION MOCKUP */}
          <div className="relative h-[600px] w-full flex items-center justify-center lg:justify-end mt-10 lg:mt-0 z-10">
            
            {/* The Morphing Device */}
            <div 
              className={`
                relative bg-zinc-950 shadow-2xl transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-zinc-800 overflow-hidden
                ${isAppMode 
                  ? 'w-[280px] h-[550px] rounded-[3rem] border-[8px]' // Phone State
                  : 'w-[520px] h-[350px] rounded-xl border-[1px] translate-y-8' // Browser State
                }
              `}
            >
               {/* 1. Header Transition */}
               <div className={`
                 w-full transition-all duration-1000 flex items-center px-4 relative z-20
                 ${isAppMode ? 'h-24 bg-zinc-900 pt-8 items-end text-white' : 'h-10 bg-zinc-900 border-b border-zinc-800'}
               `}>
                 
                 {/* Browser Elements (Hide in App Mode) */}
                 <div className={`flex items-center gap-2 w-full absolute top-1/2 -translate-y-1/2 left-4 transition-opacity duration-500 ${isAppMode ? 'opacity-0 delay-0' : 'opacity-100 delay-500'}`}>
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                      <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                    </div>
                    <div className="flex-1 mx-4 h-6 bg-black border border-zinc-800 rounded flex items-center px-2 text-[10px] text-zinc-500 font-mono">
                       <Globe size={10} className="mr-1" /> myshop.com
                    </div>
                 </div>

                 {/* App Elements (Show in App Mode) */}
                 <div className={`w-full flex justify-between items-center pb-2 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-2 delay-0'}`}>
                    <div className="font-bold text-lg text-white">MyShop</div>
                    <div className="flex gap-3 text-zinc-400">
                       <Search size={18} />
                       <ShoppingBag size={18} />
                    </div>
                 </div>
               </div>

               {/* 2. Content Area */}
               <div className="bg-black w-full h-full p-4 relative overflow-hidden">
                  {/* Hero Banner inside device */}
                  <div className={`
                    bg-zinc-900 rounded-lg mb-4 transition-all duration-1000 overflow-hidden relative border border-zinc-800
                    ${isAppMode ? 'h-40' : 'h-32'}
                  `}>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
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
                          <div className="h-24 bg-zinc-900 rounded-lg border border-zinc-800"></div>
                          <div className="h-3 w-3/4 bg-zinc-900 rounded"></div>
                          <div className="h-3 w-1/2 bg-zinc-900 rounded"></div>
                       </div>
                     ))}
                  </div>
               </div>

               {/* 3. Bottom Navigation (Only in App Mode) */}
               <div className={`
                 absolute bottom-0 left-0 right-0 h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around text-zinc-500 transition-transform duration-700
                 ${isAppMode ? 'translate-y-0' : 'translate-y-full'}
               `}>
                  <div className="flex flex-col items-center gap-1 text-white">
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
            <div className={`absolute top-0 right-10 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
               Native Navigation
            </div>
            
            <div className={`absolute bottom-20 -left-4 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 delay-100 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
               Tab Bar
            </div>

            {/* Background Decor behind device - Monochrome Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-[0.03] rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* How it Works Section - DYNAMIC SWITCHER */}
      <section id="how-it-works" className="py-32 px-6 relative bg-black overflow-hidden border-t border-zinc-900">
         {/* Subtle background gradient to distinguish section */}
         <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black z-0 pointer-events-none"></div>

         <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-6">
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
                 How it Works
               </h2>
               <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
                 Three simple steps to convert your existing website into a fully native mobile application.
               </p>

               {/* DESIGN SWITCHER CONTROLS */}
               <div className="inline-flex p-1 rounded-full bg-zinc-900 border border-zinc-800 mt-6">
                 {[
                   { id: 'sticky', label: 'Option 1: Sticky Narrative' },
                   { id: 'neon', label: 'Option 2: Neon Pipeline' },
                   { id: 'terminal', label: 'Option 3: Terminal' }
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => setSelectedDesign(opt.id as any)}
                     className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedDesign === opt.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
            </div>

            {/* RENDER SELECTED COMPONENT */}
            <div className="min-h-[500px] transition-all duration-500">
               {selectedDesign === 'sticky' && <StickyNarrative />}
               {selectedDesign === 'neon' && <NeonPipeline />}
               {selectedDesign === 'terminal' && <InteractiveTerminal />}
            </div>

         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <div className="h-6 w-6 bg-white rounded-md"></div>
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
