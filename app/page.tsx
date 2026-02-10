
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Globe, LoaderCircle, Smartphone, Zap,
  CircleCheck, Menu, X, Search, ShoppingBag, User, Home, LayoutGrid,
  CircleAlert, Sparkles, Lock, Terminal, Code, Cpu, MousePointer, Command,
  Earth, FileJson, Layers, Download, Check, Layout, Rocket
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../components/AuthModal';
import { UserMenu } from '../components/UserMenu';
import { supabase } from '../supabaseClient';
import axios from 'axios';

// ── PIPELINE FLOW COMPONENTS ────────────────────────────────────────────────

// Animated Line Component for fluid flow
const AnimatedLine = ({ 
  active, 
  vertical = false, 
  height = 'h-12', 
  width = 'w-full',
  className = ''
}: { 
  active: boolean; 
  vertical?: boolean; 
  height?: string; 
  width?: string;
  className?: string;
}) => {
  return (
    <div className={`relative bg-zinc-900 overflow-hidden ${vertical ? `w-[2px] ${height}` : `h-[2px] ${width}`} ${className}`}>
      <div 
        className={`absolute bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-700 ease-out
          ${vertical 
            ? `top-0 left-0 w-full ${active ? 'h-full' : 'h-0'}` 
            : `top-0 left-0 h-full ${active ? 'w-full' : 'w-0'}`
          }
        `}
      />
    </div>
  );
};

const PipelineNode = ({
  icon: Icon,
  title,
  subtitle,
  isActive,
  isCompleted,
  delay = 0,
  position = 'center'
}: {
  icon: any;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
  delay?: number;
  position?: 'left' | 'right' | 'center';
}) => {
  return (
    <div
      className={`
        relative flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-500 z-20
        ${position === 'center' ? 'w-64' : 'w-[160px] sm:w-64'} 
        ${isActive || isCompleted
          ? 'bg-black/80 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]'
          : 'bg-black/40 border-zinc-800/50 opacity-50 grayscale'
        }
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Tech Corners */}
      {(isActive || isCompleted) && (
        <>
          <div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-emerald-500"></div>
          <div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-emerald-500"></div>
        </>
      )}

      <div className={`
        h-10 w-10 shrink-0 rounded-md flex items-center justify-center transition-all duration-500 border
        ${isCompleted 
          ? 'bg-transparent border-transparent text-emerald-500' // Just the checkmark, no background
          : isActive 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-600'
        }
      `}>
        {isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={20} />}
      </div>
      
      <div className="flex flex-col min-w-0 flex-1">
        <span className={`text-[10px] sm:text-sm font-bold leading-tight transition-colors duration-300 font-mono whitespace-normal ${isActive || isCompleted ? 'text-emerald-50 text-shadow-sm' : 'text-zinc-600'}`}>
          {title}
        </span>
        <span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono leading-tight whitespace-normal mt-0.5">
          {isActive && !isCompleted ? 'Processing...' : subtitle}
        </span>
      </div>

      {isActive && !isCompleted && (
        <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></div>
      )}
    </div>
  );
};

const PipelineFlow = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loop = () => {
      setStep(0);
      setTimeout(() => setStep(1), 500);   // Website Active
      setTimeout(() => setStep(2), 1500);  // Line 1
      setTimeout(() => setStep(3), 2000);  // Config Active
      setTimeout(() => setStep(4), 3000);  // Config Done, Split Lines Start
      setTimeout(() => setStep(5), 3500);  // Android/iOS Active
      setTimeout(() => setStep(6), 5500);  // Build Done, Merge Lines Start
      setTimeout(() => setStep(7), 6000);  // Distro Active
      setTimeout(loop, 9000);
    };

    loop();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-10 w-full max-w-3xl mx-auto relative select-none">
      
      {/* Step 1: Source */}
      <div className="z-10">
        <PipelineNode
          icon={Earth}
          title="Website Source"
          subtitle="https://myshop.com"
          isActive={step >= 1}
          isCompleted={step >= 2}
        />
      </div>

      {/* Line 1 */}
      <AnimatedLine active={step >= 2} vertical height="h-12" />

      {/* Step 2: Config */}
      <div className="z-10">
        <PipelineNode
          icon={FileJson}
          title="Smart Config"
          subtitle="Manifest generation"
          isActive={step >= 3}
          isCompleted={step >= 4}
        />
      </div>

      {/* Split Lines Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[540px] flex flex-col items-center">
         {/* Vertical Stem from Config */}
         <AnimatedLine active={step >= 4} vertical height="h-6" />
         
         {/* Horizontal Bar - Spanning centers of the cards below */}
         {/* Width calculation: 100% - CardWidth. This places endpoints exactly at the centers. */}
         <div className="w-[calc(100%-160px)] sm:w-[calc(100%-16rem)]">
            <AnimatedLine active={step >= 4} />
         </div>

         {/* Vertical Drops to Cards */}
         <div className="flex justify-between w-full">
            <div className="w-[160px] sm:w-64 flex justify-center">
               <AnimatedLine active={step >= 4} vertical height="h-6" />
            </div>
            <div className="w-[160px] sm:w-64 flex justify-center">
               <AnimatedLine active={step >= 4} vertical height="h-6" />
            </div>
         </div>
      </div>

      {/* Step 3: Parallel Builds */}
      <div className="flex justify-between w-full z-10 gap-0 max-w-[340px] sm:max-w-[540px]">
        <div className="flex justify-center w-[160px] sm:w-64">
           <PipelineNode
             icon={Cpu}
             title="Android Build"
             subtitle="Gradle Assembly"
             isActive={step >= 5}
             isCompleted={step >= 6}
             position="left"
           />
        </div>
        <div className="flex justify-center w-[160px] sm:w-64">
           <PipelineNode
             icon={Layers}
             title="iOS Build"
             subtitle="Xcode Compilation"
             isActive={step >= 5}
             isCompleted={step >= 6}
             position="right"
           />
        </div>
      </div>

      {/* Merge Lines Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-[540px] flex flex-col items-center">
        {/* Vertical Ups from Cards */}
        <div className="flex justify-between w-full">
            <div className="w-[160px] sm:w-64 flex justify-center">
               <AnimatedLine active={step >= 6} vertical height="h-6" />
            </div>
            <div className="w-[160px] sm:w-64 flex justify-center">
               <AnimatedLine active={step >= 6} vertical height="h-6" />
            </div>
        </div>

        {/* Horizontal Merge Bar */}
        <div className="w-[calc(100%-160px)] sm:w-[calc(100%-16rem)] relative">
            {/* We need two lines animating inwards to center */}
            <div className="h-[2px] bg-zinc-900 w-full relative overflow-hidden">
               {/* Since it's a single bar, we can just animate width full if we want simple L-R */}
               {/* But for merge effect (sides to center), we might need two divs */}
               <div className={`absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500 ${step >= 6 ? 'w-1/2' : 'w-0'}`}></div>
               <div className={`absolute right-0 top-0 h-full bg-emerald-500 transition-all duration-500 ${step >= 6 ? 'w-1/2' : 'w-0'}`}></div>
            </div>
        </div>

        {/* Final Vertical Stem */}
        <AnimatedLine active={step >= 6} vertical height="h-6" />
      </div>

      {/* Step 4: Final */}
      <div className="z-10">
        <PipelineNode
          icon={Download}
          title="Distribution Ready"
          subtitle="APK & IPA Signed"
          isActive={step >= 7}
          isCompleted={step >= 7}
        />
      </div>
    </div>
  );
};

// ── INTERACTIVE TERMINAL COMPONENT ─────────────────────────────────────────

const InteractiveTerminal = () => {
  const [lines, setLines] = useState<{ text: string; color?: string; id: number }[]>([]);

  useEffect(() => {
    const sequence = [
      { text: "user@dev:~$ web2app analyze --url https://myshop.com", color: "text-white", delay: 0 },
      { text: "→ Initializing build environment...", color: "text-zinc-500", delay: 800 },
      { text: "→ Resolving DNS for myshop.com...", color: "text-zinc-500", delay: 1400 },
      { text: "✓ Connection established (Latency: 24ms)", color: "text-emerald-400", delay: 2000 },
      { text: "[scraper] Parsing DOM structure...", color: "text-blue-400", delay: 2800 },
      { text: " ├─ Found <title>: My Awesome Shop", color: "text-zinc-300", delay: 3200 },
      { text: " ├─ Detected theme-color: #000000", color: "text-zinc-300", delay: 3500 },
      { text: " └─ Extracted high-res icon (192x192)", color: "text-zinc-300", delay: 3800 },
      { text: "[native] Generating AndroidManifest.xml...", color: "text-purple-400", delay: 4500 },
      { text: "[native] Injecting WebView Javascript Bridge...", color: "text-purple-400", delay: 5000 },
      { text: "[build] Compiling resources...", color: "text-yellow-400", delay: 5800 },
      { text: "✓ Signed APK generated: app-release.apk (14MB)", color: "text-emerald-400 font-bold", delay: 6800 },
      { text: "user@dev:~$ _", color: "text-white animate-pulse", delay: 7500 },
    ];

    const runSequence = () => {
      setLines([]);
      sequence.forEach(({ text, color, delay }, index) => {
        setTimeout(() => {
          setLines(prev =>
            index === 0
              ? [{ text, color, id: index }]
              : [...prev, { text, color, id: index }]
          );
        }, delay);
      });
    };

    runSequence();
    const interval = setInterval(runSequence, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-12 lg:gap-16 items-center max-w-4xl mx-auto">
      {/* Text side */}
      <div className="space-y-6 lg:space-y-8 text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 text-xs font-mono font-bold tracking-wider mb-2 mx-auto">
          <Terminal size={14} /> AUTOMATED PIPELINE
        </div>

        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance">
          Engineering power,<br />
          <span className="text-zinc-600">zero code required.</span>
        </h3>

        <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto text-balance">
          We abstracted the entire React Native build pipeline into a simple URL input. What typically takes a development team weeks to configure, our engine processes in seconds.
        </p>
      </div>

      {/* Terminal side */}
      <div className="relative group w-full max-w-2xl px-4">
        {/* Glow behind */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-600/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative w-full bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 font-mono text-xs md:text-sm h-[360px] flex flex-col">
          <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
              <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Command size={12} />
              <span>builder-cli — zsh</span>
            </div>
            <div className="w-10"></div>
          </div>

          <div className="p-4 md:p-6 flex-1 overflow-hidden flex flex-col justify-end pb-8">
            <div className="space-y-2 font-mono text-left">
              {lines.map((line) => (
                <div key={line.id} className={`${line.color} break-all animate-in slide-in-from-bottom-1 fade-in duration-200`}>
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
// ── MAIN LANDING PAGE COMPONENT ────────────────────────────────────────────

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
  const [isAppMode, setIsAppMode] = useState(false);

  // Theme & body background
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#000000');
    else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#000000';
      document.head.appendChild(newMeta);
    }
    document.body.style.backgroundColor = '#000000';
  }, []);

  // Auth listener
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

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // App mode cycle animation
  useEffect(() => {
    const interval = setInterval(() => setIsAppMode(prev => !prev), 4000);
    return () => clearInterval(interval);
  }, []);

  // URL live validation
  useEffect(() => {
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
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\\#[-a-z\\d_]*)?$',
      'i'
    );

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
    } catch (err) {
      console.error('Analysis failed, proceeding with raw URL', err);
      const params = new URLSearchParams();
      params.set('url', fullUrl);
      router.push(`/builder?${params.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white selection:bg-white selection:text-black font-sans overflow-x-hidden flex flex-col">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Header / Navigation */}
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
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setIsAuthModalOpen(true)}>
                  Log in
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-9 font-bold transition-all" onClick={() => setIsAuthModalOpen(true)}>
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
                    {user.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-white truncate max-w-[180px]">{user.email}</span>
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
              <Button className="w-full bg-white text-black" onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}>
                Login / Sign Up
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Hero Section with Input & Planet */}
      <section className="relative z-10 w-full overflow-hidden flex flex-col justify-center items-center bg-black border-b border-white/5 h-[100svh] pt-20 lg:h-screen">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:32px_32px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
        </div>

        {/* Content Wrapper - Updated for Mobile Spread */}
        <div className="max-w-5xl mx-auto flex flex-col h-full sm:h-auto justify-evenly sm:justify-center gap-4 sm:gap-8 items-center relative z-30 w-full px-4 md:px-6 pb-10 sm:pb-0">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 w-fit mx-auto backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-medium text-zinc-300 uppercase tracking-wider">Live App Generation Engine V2.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.0] lg:leading-[0.95] text-white max-w-4xl text-center text-balance">
            Convert your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500">Website to App</span>
            <br/> in seconds.
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto font-light px-2 text-center text-balance">
            Stop spending months and thousands of dollars on mobile development.
            Paste your URL, customize your brand, and publish to the App Store & Google Play today.
          </p>

          <form onSubmit={handleStart} className="relative max-w-lg mx-auto w-full group px-0 sm:px-2 z-40">
            <div className="relative bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-emerald-900/10 hover:border-emerald-500/20 overflow-hidden">
              <div className="flex items-center px-4 py-3 gap-2 border-b border-white/5 bg-white/[0.02]">
                <div className="flex gap-2">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ff5f57] shadow-sm"></div>
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#febc2e] shadow-sm"></div>
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#28c840] shadow-sm"></div>
                </div>
                <div className="ml-auto text-[10px] text-zinc-600 font-mono hidden sm:flex items-center gap-1">
                  <Lock size={10} />
                  <span>secure browser</span>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col">
                {/* 1. Internal Label */}
                <div className="flex items-center gap-2 mb-3">
                  <Layout size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">Enter Website URL</span>
                </div>

                {/* 2. Industrial Input */}
                <div 
                  onClick={() => inputRef.current?.focus()}
                  className={`
                    relative flex items-center bg-black border transition-all duration-300 rounded-lg overflow-hidden cursor-text h-14
                    ${isInputFocused ? 'border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}
                  `}
                >
                  <div className="h-full w-1.5 bg-zinc-800 mr-3"></div> {/* Decorative left strip */}
                  
                  <span className="text-zinc-600 font-mono text-sm select-none mr-1">https://</span>
                  
                  <input
                      ref={inputRef}
                      id="hero-input"
                      type="text"
                      value={url}
                      onChange={(e) => {
                        let val = e.target.value.replace(/^https?:\/\//, '');
                        setUrl(val);
                        if (error) setError('');
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="myshop.com"
                      className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-700 focus:ring-0 p-0 outline-none w-full text-sm font-mono tracking-tight"
                      autoComplete="off"
                  />
                  
                  {url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUrl('');
                          setIsUrlValid(false);
                          inputRef.current?.focus();
                        }}
                        className="mr-3 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                  )}
                </div>

                {/* 3. Helper Text */}
                <p className="mt-3 mb-6 text-[11px] text-zinc-500 font-mono pl-1">
                   Paste the full URL of your website to start the conversion process.
                </p>

                {/* 4. Button - Full Width, Heavy */}
                <Button
                  type="submit"
                  className={`
                    w-full h-12 bg-zinc-100 text-black hover:bg-white border border-transparent rounded-lg font-bold text-sm transition-all transform flex items-center justify-center gap-2
                    ${isUrlValid ? 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.01]' : 'opacity-70 cursor-not-allowed bg-zinc-800 text-zinc-500 border-zinc-700'}
                  `}
                  disabled={isLoading || !isUrlValid}
                >
                  {isLoading ? (
                    <LoaderCircle className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Launch</span>
                      <Rocket size={16} /> 
                    </>
                  )}
                </Button>

                {/* 5. Tags - Integrated nicely below */}
                <div className="grid grid-cols-3 gap-3 mt-4 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-medium text-zinc-400">
                      <Sparkles size={12} className="text-purple-400" /> No Code
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-medium text-zinc-400">
                      <Smartphone size={12} className="text-emerald-400" /> APK
                    </div>
                    <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-medium text-zinc-400">
                      <Smartphone size={12} className="text-blue-400" /> iOS
                    </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center text-center">
                <div className="inline-flex items-center gap-2 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                  <CircleAlert size={16} /> {error}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Planet Effect - Updated for Mobile Anchor */}
        <div className="absolute inset-0 pointer-events-none select-none z-10">
          <div className="absolute left-1/2 -translate-x-1/2 w-[180vw] h-[65%] sm:h-[45%] bottom-0 bg-emerald-900/20 blur-[80px] rounded-t-[100%] z-0"></div>

          <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[200vw] h-[200vh]" style={{ top: 'calc(100% - 220px)' }}>
            <div className="absolute inset-0 rounded-[100%] bg-emerald-500/10 blur-[60px] animate-pulse"></div>
            <div className="absolute inset-[5%] rounded-[100%] bg-emerald-500/20 blur-[30px]"></div>
            <div className="absolute inset-[8%] rounded-[100%] bg-gradient-to-b from-emerald-400/30 to-transparent blur-[10px]"></div>
            <div className="absolute inset-[10%] rounded-[100%] bg-black border-t border-emerald-500/50 shadow-[0_-20px_100px_-10px_rgba(16,185,129,0.3),inset_0_20px_60px_-10px_rgba(16,185,129,0.2)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-950/20 to-black opacity-90"></div>
            </div>
          </div>

          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent blur-[1px] z-20" style={{ top: 'calc(100% - 220px)' }}></div>
        </div>
      </section>

      {/* Mockup Section */}
      <section className="relative z-10 py-24 bg-black border-t border-zinc-900">
        <div className="max-w-5xl mx-auto flex items-center justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative h-[450px] sm:h-[600px] w-full flex items-center justify-center z-10 overflow-visible">
            <div
              className={`
                relative bg-zinc-950 shadow-2xl transition-all duration-[1500ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-zinc-800 overflow-hidden z-20 origin-top
                ${isAppMode
                  ? 'w-[240px] h-[480px] sm:w-[280px] sm:h-[550px] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px]'
                  : 'w-[90%] sm:w-[520px] h-[300px] sm:h-[350px] rounded-xl border-[1px] translate-y-8'
                }
              `}
            >
              {/* Header transition */}
              <div className={`
                w-full transition-all duration-1000 flex items-center px-4 relative z-20
                ${isAppMode ? 'h-20 sm:h-24 bg-zinc-900 pt-6 sm:pt-8 items-end text-white' : 'h-10 bg-zinc-900 border-b border-zinc-800'}
              `}>
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

                <div className={`w-full flex justify-between items-center pb-2 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-2 delay-0'}`}>
                  <div className="font-bold text-base sm:text-lg text-white">MyShop</div>
                  <div className="flex gap-3 text-zinc-400">
                    <Search size={18} />
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>

              {/* Content area */}
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

              {/* Bottom nav bar */}
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

            <div className={`hidden sm:block absolute top-0 right-10 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
              Native Navigation
            </div>

            <div className={`hidden sm:block absolute bottom-20 -left-4 bg-zinc-900/50 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700 text-xs font-mono text-zinc-300 transition-all duration-500 delay-100 ${isAppMode ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              Tab Bar
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 relative bg-zinc-950 overflow-hidden border-t border-zinc-900 pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 z-0"></div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-20 md:space-y-32">
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

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 px-6 bg-black mt-auto relative z-10 pb-[env(safe-area-inset-bottom)]">
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
