
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Globe, Loader2, Smartphone, Zap, 
  CheckCircle2, Menu, X, Search, ShoppingBag, User, Home, LayoutGrid,
  AlertCircle, Sparkles, Lock, Terminal, Code, Cpu, MousePointer2, Command,
  Globe2, FileJson, Layers, Download, Check, Layout
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/AuthModal';
import { UserMenu } from '../components/UserMenu';
import { supabase } from '../supabaseClient';
import axios from 'axios';

// --- PIPELINE FLOW COMPONENT ---

const PipelineNode = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  isActive, 
  isCompleted, 
  delay = 0,
  position = 'center' // 'left', 'right', 'center'
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  isActive: boolean, 
  isCompleted: boolean, 
  delay?: number,
  position?: 'left' | 'right' | 'center'
}) => {
  return (
    <div 
      className={`
        relative flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-700 w-64 z-20
        ${isActive || isCompleted 
          ? 'bg-zinc-900 border-zinc-600 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]' 
          : 'bg-black border-zinc-900 opacity-60 grayscale'
        }
        ${position === 'left' ? '-translate-x-4' : ''}
        ${position === 'right' ? 'translate-x-4' : ''}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`
        h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-500
        ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-white text-black animate-pulse' : 'bg-zinc-800 text-zinc-500'}
      `}>
        {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
      </div>
      <div className="flex flex-col">
        <span className={`text-sm font-bold transition-colors duration-300 ${isActive || isCompleted ? 'text-white' : 'text-zinc-500'}`}>
          {title}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {isActive && !isCompleted ? 'Processing...' : subtitle}
        </span>
      </div>
      
      {/* Active Indicator Dot */}
      {isActive && !isCompleted && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></div>
      )}
    </div>
  );
};

const PipelineFlow = () => {
  const [step, setStep] = useState(0);
  
  // Animation Loop
  useEffect(() => {
    const sequence = [
      { step: 1, delay: 1000 }, // Activate Node 1
      { step: 2, delay: 2000 }, // Line to Node 2
      { step: 3, delay: 2500 }, // Activate Node 2
      { step: 4, delay: 3500 }, // Split Lines
      { step: 5, delay: 4000 }, // Activate Node 3a & 3b
      { step: 6, delay: 5500 }, // Merge Lines
      { step: 7, delay: 6000 }, // Activate Node 4
      { step: 8, delay: 8000 }, // Reset
    ];

    let timeouts: any[] = [];

    const runAnimation = () => {
      setStep(0);
      let cumulativeTime = 0;
      
      sequence.forEach(({ step: s, delay }) => {
         cumulativeTime += delay;
         const t = setTimeout(() => {
            if (s === 8) runAnimation(); // Loop
            else setStep(s);
         }, (s === 1 ? 0 : 0) + cumulativeTime - (s === 8 ? 0 : 0)); 
         timeouts.push(t);
      });
    };

    const loop = () => {
       setStep(0);
       timeouts.push(setTimeout(() => setStep(1), 500));  // Start
       timeouts.push(setTimeout(() => setStep(2), 2000)); // Line 1
       timeouts.push(setTimeout(() => setStep(3), 2500)); // Analyze
       timeouts.push(setTimeout(() => setStep(4), 4000)); // Lines Split
       timeouts.push(setTimeout(() => setStep(5), 4500)); // Build
       timeouts.push(setTimeout(() => setStep(6), 6500)); // Lines Merge
       timeouts.push(setTimeout(() => setStep(7), 7000)); // Deploy
       timeouts.push(setTimeout(loop, 9500)); // Reset
    };

    loop();

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 w-full max-w-2xl mx-auto relative select-none scale-[0.8] sm:scale-100 origin-center">
       {/* Background Grid for this component specifically */}
       <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05]"></div>
       
       {/* --- LEVEL 1: INPUT --- */}
       <div className="z-10">
          <PipelineNode 
            icon={Globe2} 
            title="Website Source" 
            subtitle="https://myshop.com"
            isActive={step >= 1}
            isCompleted={step >= 2}
          />
       </div>

       {/* Connector 1 */}
       <div className={`h-12 w-0.5 transition-colors duration-500 ${step >= 2 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>

       {/* --- LEVEL 2: ANALYSIS --- */}
       <div className="z-10">
          <PipelineNode 
            icon={FileJson} 
            title="Smart Config" 
            subtitle="Manifest generation"
            isActive={step >= 3}
            isCompleted={step >= 4}
          />
       </div>

       {/* Connector Split */}
       <div className="relative h-12 w-full max-w-[280px]">
          {/* Vertical Stem */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-6 w-0.5 transition-colors duration-500 ${step >= 4 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
          
          {/* Horizontal Bar */}
          <div className={`absolute top-6 left-0 right-0 h-0.5 transition-colors duration-500 ${step >= 4 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
          
          {/* Left Vertical Drop */}
          <div className={`absolute top-6 left-0 h-6 w-0.5 transition-colors duration-500 ${step >= 4 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
          
          {/* Right Vertical Drop */}
          <div className={`absolute top-6 right-0 h-6 w-0.5 transition-colors duration-500 ${step >= 4 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
       </div>

       {/* --- LEVEL 3: PARALLEL BUILDS --- */}
       <div className="flex justify-between w-full z-10 gap-8">
          <PipelineNode 
            icon={Cpu} 
            title="Android Build" 
            subtitle="Gradle Assembly"
            isActive={step >= 5}
            isCompleted={step >= 6}
            position="left"
          />
          <PipelineNode 
            icon={Layers} 
            title="iOS Build" 
            subtitle="Xcode Compilation"
            isActive={step >= 5}
            isCompleted={step >= 6}
            position="right"
          />
       </div>

       {/* Connector Merge */}
       <div className="relative h-12 w-full max-w-[280px]">
          {/* Left Vertical Drop */}
          <div className={`absolute top-0 left-0 h-6 w-0.5 transition-colors duration-500 ${step >= 6 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
          
          {/* Right Vertical Drop */}
          <div className={`absolute top-0 right-0 h-6 w-0.5 transition-colors duration-500 ${step >= 6 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>

          {/* Horizontal Bar */}
          <div className={`absolute top-6 left-0 right-0 h-0.5 transition-colors duration-500 ${step >= 6 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>

          {/* Vertical Stem */}
          <div className={`absolute top-6 left-1/2 -translate-x-1/2 h-6 w-0.5 transition-colors duration-500 ${step >= 6 ? 'bg-white shadow-[0_0_10px_white]' : 'bg-zinc-800'}`}></div>
       </div>

       {/* --- LEVEL 4: DISTRIBUTION --- */}
       <div className="z-10">
          <PipelineNode 
            icon={Download} 
            title="Distribution Ready" 
            subtitle="APK & IPA Signed"
            isActive={step >= 7}
            isCompleted={step >= 7} // Stays completed until reset
          />
       </div>

    </div>
  );
};


// --- ENHANCED TERMINAL COMPONENT ---

const InteractiveTerminal = () => {
  const [lines, setLines] = useState<{text: string, color?: string, id: number}[]>([]);
  
  useEffect(() => {
    // The sequence simulates a real build process
    const sequence = [
      { text: "user@dev:~$ web2app analyze --url https://myshop.com", color: "text-white", delay: 0 },
      { text: "→ Initializing build environment...", color: "text-zinc-500", delay: 800 },
      { text: "→ Resolving DNS for myshop.com...", color: "text-zinc-500", delay: 1400 },
      { text: "✓ Connection established (Latency: 24ms)", color: "text-emerald-400", delay: 2000 },
      { text: "[scraper] Parsing DOM structure...", color: "text-blue-400", delay: 2800 },
      { text: "  ├─ Found <title>: My Awesome Shop", color: "text-zinc-300", delay: 3200 },
      { text: "  ├─ Detected theme-color: #000000", color: "text-zinc-300", delay: 3500 },
      { text: "  └─ Extracted high-res icon (192x192)", color: "text-zinc-300", delay: 3800 },
      { text: "[native] Generating AndroidManifest.xml...", color: "text-purple-400", delay: 4500 },
      { text: "[native] Injecting WebView Javascript Bridge...", color: "text-purple-400", delay: 5000 },
      { text: "[build] Compiling resources...", color: "text-yellow-400", delay: 5800 },
      { text: "✓ Signed APK generated: app-release.apk (14MB)", color: "text-emerald-400 font-bold", delay: 6800 },
      { text: "user@dev:~$ _", color: "text-white animate-pulse", delay: 7500 },
    ];

    let timeouts: any[] = [];
    
    // Reset and start loop
    const runSequence = () => {
      setLines([]);
      sequence.forEach(({ text, color, delay }, index) => {
        const timeout = setTimeout(() => {
          setLines(prev => {
             // If this is the start of a new loop (index 0), clear previous lines
             if (index === 0) return [{ text, color, id: index }];
             // If it's the last "cursor" line, replace the previous cursor if exists, or add it
             return [...prev, { text, color, id: index }];
          });
        }, delay);
        timeouts.push(timeout);
      });
    };

    runSequence();
    const interval = setInterval(runSequence, 9000); // Loop every 9 seconds

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-12 lg:gap-16 items-center max-w-4xl mx-auto">
       
       {/* Text Side - Now Centered & First */}
       <div className="space-y-6 lg:space-y-8 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/20 text-indigo-400 border border-indigo-900/50 text-xs font-mono font-bold tracking-wider mb-2 mx-auto">
            <Terminal size={14} /> AUTOMATED PIPELINE
          </div>
          
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Engineering power,<br />
            <span className="text-zinc-600">zero code required.</span>
          </h3>
          
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
             We abstracted the entire React Native build pipeline into a simple URL input. What typically takes a development team weeks to configure, our engine processes in seconds.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 pt-4 max-w-2xl mx-auto">
             <div className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
               <div className="p-2 bg-zinc-900 rounded-lg text-white w-fit mx-auto"><Code size={20} /></div>
               <div className="font-bold text-white">Full Analysis</div>
               <p className="text-xs md:text-sm text-zinc-500">We parse your DOM to extract branding, icons, and metadata automatically.</p>
             </div>
             <div className="flex flex-col gap-2 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
               <div className="p-2 bg-zinc-900 rounded-lg text-white w-fit mx-auto"><Cpu size={20} /></div>
               <div className="font-bold text-white">Cloud Compile</div>
               <p className="text-xs md:text-sm text-zinc-500">Dedicated build servers generate signed AAB & APK files instantly.</p>
             </div>
          </div>
       </div>

       {/* Terminal Side - Now Second */}
       <div className="relative group w-full max-w-2xl px-4">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          
          <div className="relative w-full bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 font-mono text-xs md:text-sm">
             {/* Terminal Header */}
             <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-zinc-800">
               <div className="flex gap-2">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                 <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
               </div>
               <div className="flex items-center gap-2 text-zinc-500">
                  <Command size={12} />
                  <span>builder-cli — zsh</span>
               </div>
               <div className="w-10"></div> {/* Spacer for centering */}
             </div>
             
             {/* Terminal Body */}
             <div className="p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col justify-end pb-8">
                <div className="space-y-2 font-mono text-left">
                  {lines.map((line) => (
                    <div key={line.id} className={`${line.color} break-all`}>
                      {line.text}
                    </div>
                  ))}
                </div>
             </div>
          </div>
       </div>

    </div>
  );
};


// --- MAIN PAGE COMPONENT ---

export default function LandingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);
  
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

  // Validate URL live
  useEffect(() => {
     // Simple regex for basic validation (needs at least some domain structure)
     const pattern = /^((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))$/i;
     setIsUrlValid(pattern.test(url));
  }, [url]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('Please enter your website URL');
      return;
    }

    const fullUrl = `https://${url.replace(/^https?:\/\//, '')}`;
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
      '(\\\#[-a-z\\d_]*)?$','i'); 

    if (!urlPattern.test(fullUrl)) {
      setError('Please enter a valid URL (e.g. myshop.com)');
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/scrape', { url: fullUrl });
      
      const params = new URLSearchParams();
      params.set('url', data.url || fullUrl);
      
      if (data.title) params.set('name', data.title);
      if (data.themeColor) params.set('color', data.themeColor);
      if (data.icon) params.set('icon', data.icon);

      router.push(`/builder?${params.toString()}`);
    } catch (error) {
      console.error('Analysis failed, proceeding with raw URL');
      const params = new URLSearchParams();
      params.set('url', fullUrl);
      router.push(`/builder?${params.toString()}`);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white selection:bg-white selection:text-black font-sans overflow-x-hidden flex flex-col">
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <img 
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                alt="Logo" 
                className="relative h-9 w-9 rounded-lg transition-all duration-300"
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

      {/* --- SECTION 1: HERO & INPUT --- */}
      <section className="relative z-10 h-[100dvh] w-full pt-20 sm:pt-28 pb-4 px-4 md:px-6 overflow-hidden flex flex-col justify-center items-center bg-black border-b border-white/5">
        
        {/* Background Dots for Section 1 only */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:32px_32px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
        </div>

        <div className="max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6 md:gap-10 items-center relative z-20 w-full mb-12 sm:mb-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 w-fit mx-auto backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase tracking-wider">Live App Generation Engine V2.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] sm:leading-[0.95] text-white max-w-4xl text-center">
              Convert your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500">Website to App</span>
              <br/> in seconds.
            </h1>

            <p className="text-sm sm:text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto font-light px-2 text-center">
              Stop spending months and thousands of dollars on mobile development. 
              Paste your URL, customize your brand, and publish to the App Store & Google Play today.
            </p>

            {/* Input Form */}
            <form onSubmit={handleStart} className="mt-2 sm:mt-6 relative max-w-lg mx-auto w-full group px-2 z-30">
              <div className="relative bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-emerald-900/10 hover:border-emerald-500/20 overflow-hidden">
                <div className="flex items-center px-4 py-3 gap-2 border-b border-white/5 bg-white/[0.02]">
                   <div className="flex gap-2">
                     <div className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
                     <div className="h-3 w-3 rounded-full bg-[#febc2e] shadow-sm"></div>
                     <div className="h-3 w-3 rounded-full bg-[#28c840] shadow-sm"></div>
                   </div>
                   <div className="ml-auto text-[10px] text-zinc-600 font-mono hidden sm:flex items-center gap-1">
                      <Lock size={10} />
                      <span>secure browser</span>
                   </div>
                </div>

                <div className="p-4 flex flex-col gap-4">
                  <div 
                    onClick={() => inputRef.current?.focus()}
                    className={`relative flex items-center bg-black border transition-all duration-300 rounded-xl overflow-hidden cursor-text ${isInputFocused ? 'border-zinc-500 ring-1 ring-zinc-500/50' : 'border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="pl-4 pr-2 text-zinc-500 h-8 flex items-center shrink-0">
                      <Globe size={18} className={`${isInputFocused ? 'text-white' : ''} transition-colors duration-300`} />
                    </div>
                    <span className="text-zinc-500 font-mono text-base select-none pl-1 shrink-0">https://</span>
                    <input 
                      ref={inputRef}
                      id="hero-input"
                      type="text" 
                      value={url}
                      onChange={(e) => {
                        let val = e.target.value;
                        val = val.replace(/^https?:\/\//, '');
                        setUrl(val);
                        if (error) setError('');
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="myshop.com"
                      className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-600 focus:ring-0 px-0.5 py-4 outline-none w-full text-base font-mono tracking-tight"
                    />
                    {url && (
                      <button 
                        type="button"
                        onClick={() => {
                          setUrl('');
                          setIsUrlValid(false);
                          inputRef.current?.focus();
                        }}
                        className="pr-4 pl-2 text-zinc-500 hover:text-white transition-colors"
                      >
                         <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className={`
                       w-full h-12 bg-black text-white border border-zinc-700 rounded-xl font-bold text-base shadow-lg shadow-emerald-500/10 transition-all transform flex items-center justify-center gap-2
                       ${isUrlValid ? 'hover:bg-zinc-900 hover:border-zinc-500 hover:scale-[1.02] active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'}
                    `}
                    disabled={isLoading || !isUrlValid}
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin text-white" size={20} />
                    ) : (
                      <>
                        <Layout size={20} className="text-white" />
                        <span>Start Building</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="absolute -bottom-10 left-0 right-0 flex justify-center text-center">
                   <div className="inline-flex items-center gap-2 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                      <AlertCircle size={16} /> {error}
                   </div>
                </div>
              )}

              <div className="mt-4 flex flex-row items-center justify-center gap-3 sm:gap-6 w-full text-xs sm:text-sm font-medium text-zinc-500">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 whitespace-nowrap">
                   <CheckCircle2 size={16} className="text-emerald-500" /> Free Preview
                </span>
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 whitespace-nowrap">
                   <Sparkles size={16} className="text-indigo-400" /> No Code Required
                </span>
              </div>
            </form>
        </div>

        {/* --- PLANET HORIZON EFFECT (ANCHORED TO BOTTOM) --- */}
        <div className="absolute bottom-0 left-0 right-0 h-[35vh] sm:h-[45vh] max-h-[500px] overflow-hidden pointer-events-none select-none z-0">
             
             {/* Deep Atmosphere / Background Glow */}
             <div className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 w-[180vw] h-[60vh] bg-emerald-900/20 blur-[80px] rounded-[100%] z-0"></div>

             {/* The Planet Group - Fully Responsive */}
             <div className="absolute bottom-[-20vh] md:bottom-[-200px] left-1/2 -translate-x-1/2 w-[180vw] md:w-[120vw] h-[50vh] md:h-[600px] z-10">
                 
                 {/* Layer 1: Soft Outer Glow */}
                 <div className="absolute inset-0 rounded-[100%] bg-emerald-500/10 blur-[60px] animate-pulse"></div>
                 
                 {/* Layer 2: Medium Glow */}
                 <div className="absolute inset-[5%] rounded-[100%] bg-emerald-500/20 blur-[30px]"></div>
                 
                 {/* Layer 3: Sharp Glow / Border */}
                 <div className="absolute inset-[8%] rounded-[100%] bg-gradient-to-b from-emerald-400/30 to-transparent blur-[10px]"></div>

                 {/* Main Black Body with Inner Glow Halo */}
                 <div className="absolute inset-[10%] rounded-[100%] bg-black border-t-2 border-emerald-500/60 shadow-[0_-15px_80px_-10px_rgba(16,185,129,0.4),_inset_0_10px_50px_-10px_rgba(16,185,129,0.5)] overflow-hidden">
                    {/* Inner Texture/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/20 via-emerald-950/30 to-transparent opacity-80"></div>
                 </div>
             </div>
             
             {/* Sharpest Horizon Line Overlay */}
             <div className="absolute bottom-[25vh] md:bottom-[300px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent blur-[1px] z-20"></div>
        </div>
      </section>

      {/* --- SECTION 2: MOCKUP SHOWCASE --- */}
      {/* Black Background */}
      <section className="relative z-10 py-24 bg-black border-t border-zinc-900">
          <div className="max-w-5xl mx-auto flex items-center justify-center relative">
            
            {/* Ambient Background Glow for Mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

            {/* TRANSFORMATION ANIMATION MOCKUP */}
            <div className="relative h-[450px] sm:h-[600px] w-full flex items-center justify-center z-10 overflow-visible">
              
              {/* The Morphing Device */}
              <div 
                className={`
                  relative bg-zinc-950 shadow-2xl transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-zinc-800 overflow-hidden z-20 origin-top
                  ${isAppMode 
                    ? 'w-[240px] h-[480px] sm:w-[280px] sm:h-[550px] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px]' // Phone State
                    : 'w-[90%] sm:w-[520px] h-[300px] sm:h-[350px] rounded-xl border-[1px] translate-y-8' // Browser State
                  }
                `}
              >
                 {/* 1. Header Transition */}
                 <div className={`
                   w-full transition-all duration-1000 flex items-center px-4 relative z-20
                   ${isAppMode ? 'h-20 sm:h-24 bg-zinc-900 pt-6 sm:pt-8 items-end text-white' : 'h-10 bg-zinc-900 border-b border-zinc-800'}
                 `}>
                   
                   {/* Browser Elements */}
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

                   {/* App Elements */}
                   <div className={`w-full flex justify-between items-center pb-2 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-2 delay-0'}`}>
                      <div className="font-bold text-base sm:text-lg text-white">MyShop</div>
                      <div className="flex gap-3 text-zinc-400">
                         <Search size={18} />
                         <ShoppingBag size={18} />
                      </div>
                   </div>
                 </div>

                 {/* 2. Content Area */}
                 <div className="bg-black w-full h-full p-4 relative overflow-hidden">
                    <div className={`
                      bg-zinc-900 rounded-lg mb-4 transition-all duration-1000 overflow-hidden relative border border-zinc-800
                      ${isAppMode ? 'h-32 sm:h-40' : 'h-24 sm:h-32'}
                    `}>
                       <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-zinc-800 text-white flex items-center justify-center border border-zinc-700">
                             <ShoppingBag size={20} />
                          </div>
                       </div>
                    </div>

                    <div className={`
                      grid gap-3 transition-all duration-1000
                      ${isAppMode ? 'grid-cols-1' : 'grid-cols-3'}
                    `}>
                       {[1, 2, 3].map((i) => (
                         <div key={i} className="space-y-2">
                            <div className="h-20 sm:h-24 bg-zinc-900 rounded-lg border border-zinc-800"></div>
                            <div className="h-3 w-3/4 bg-zinc-900 rounded"></div>
                            <div className="h-3 w-1/2 bg-zinc-900 rounded"></div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* 3. Bottom Navigation */}
                 <div className={`
                   absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around text-zinc-500 transition-transform duration-700
                   ${isAppMode ? 'translate-y-0' : 'translate-y-full'}
                 `}>
                    <div className="flex flex-col items-center gap-1 text-white">
                       <Home size={18} />
                       <span className="text-[10px] font-medium">Home</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                       <LayoutGrid size={18} />
                       <span className="text-[10px] font-medium">Cat.</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                       <User size={18} />
                       <span className="text-[10px] font-medium">Profile</span>
                    </div>
                 </div>
              </div>

              {/* Labels - Hidden on small mobile */}
              <div className={`hidden sm:block absolute top-0 right-10 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                 Native Navigation
              </div>
              
              <div className={`hidden sm:block absolute bottom-20 -left-4 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 delay-100 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                 Tab Bar
              </div>
            </div>
          </div>
      </section>

      {/* --- SECTION 3: HOW IT WORKS & TERMINAL --- */}
      {/* Background Pattern: Grid Shapes */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative bg-zinc-950 overflow-hidden border-t border-zinc-900">
         {/* Different Background Pattern: Grid */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
              style={{
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
              }}
         ></div>
         
         <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0"></div>

         <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-32">
            <InteractiveTerminal />

            <div className="flex flex-col items-center">
               <div className="text-center mb-10 md:mb-16 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-zinc-400">
                     <Zap size={12} className="text-amber-400" /> INSTANT BUILD FACTORY
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-white">
                    From URL to Store.<br/>
                    <span className="text-zinc-600">Complete automated flow.</span>
                  </h3>
               </div>
               
               <PipelineFlow />
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto relative z-10">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
               <div className="h-6 w-6 relative">
                  <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-full w-full object-contain rounded-md" />
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
