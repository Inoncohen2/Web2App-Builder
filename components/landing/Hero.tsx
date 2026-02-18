
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, X, Lock, Layout, Code, AppWindow, ShieldCheck, Box, CircleAlert, Zap, Globe, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../supabaseClient';

const TransitionSplash = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(98), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-[#09090b] shadow-2xl animate-in zoom-in-95 duration-500 p-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
           <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse"></div>
           <div className="relative h-16 w-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center shadow-inner">
              <LoaderCircle size={32} className="text-emerald-500 animate-spin" />
           </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">Analyzing Website Source</h3>
        <p className="text-sm text-zinc-500 mb-8 max-w-[90%] mx-auto leading-relaxed">
          Checking for existing projects and extracting metadata...
        </p>
        <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden">
           <div 
             className="h-full bg-emerald-500 rounded-full transition-all duration-[3000ms] ease-out"
             style={{ width: `${progress}%` }}
           ></div>
        </div>
      </div>
    </div>
  );
};

// Fixed: Generates HEX instead of HSL to prevent HTML5 color input errors
const generateColorFromDomain = (domain: string) => {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};

// Security: Basic Sanitization
const sanitizeInput = (input: string) => {
  return input.replace(/[<>'"/]/g, '').trim();
};

export const Hero = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [error, setError] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);
  
  // Realtime Preview State
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [isIconLoading, setIsIconLoading] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState<string | null>(null);
  const [magicColor, setMagicColor] = useState<string>('');

  // 1. Validation Logic
  useEffect(() => {
    // Stricter Regex for URL validation
    const pattern = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,24}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i;
    const isValid = pattern.test(url) && url.length > 3 && !url.includes('<') && !url.includes('>');
    setIsUrlValid(isValid);

    if (!isValid) {
      setDetectedDomain(null);
      setPreviewIcon(null);
      setMagicColor('');
    }
  }, [url]);

  // 2. Debounced Edge Function Call for Icon
  useEffect(() => {
    if (!isUrlValid || !url) return;

    // Show domain immediately for UX
    try {
        let cleanUrl = url.toLowerCase();
        if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
        const hostname = new URL(cleanUrl).hostname;
        setDetectedDomain(hostname);
        setMagicColor(generateColorFromDomain(hostname));
    } catch(e) {}

    setIsIconLoading(true);
    
    // Wait 800ms after typing stops before calling API
    const debounceTimer = setTimeout(async () => {
      try {
        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

        const { data, error } = await supabase.functions.invoke('scrape-site', {
            body: { url: targetUrl }
        });

        if (data && data.icon) {
            setPreviewIcon(data.icon);
        } else {
            setPreviewIcon(null); // Fallback to globe if no icon found
        }
      } catch (err) {
        console.warn("Icon fetch failed:", err);
        setPreviewIcon(null);
      } finally {
        setIsIconLoading(false);
      }
    }, 800);

    return () => clearTimeout(debounceTimer);
  }, [url, isUrlValid]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Sanitize before submitting
    const safeUrl = sanitizeInput(url);

    if (!isUrlValid || safeUrl.length === 0) {
      setError('Please enter a valid URL (e.g. myshop.com)');
      return;
    }

    // Normalize URL
    const cleanedUrl = safeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const fullUrl = `https://${cleanedUrl}`;
    
    setIsLoading(true);
    setShowSplash(true);

    try {
      // 1. Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 2. Check DB for existing app with this URL
        const { data: existingApps } = await supabase
          .from('apps')
          .select('id, website_url')
          .eq('user_id', user.id)
          .ilike('website_url', `%${cleanedUrl}%`) 
          .limit(1);

        if (existingApps && existingApps.length > 0) {
           await new Promise(resolve => setTimeout(resolve, 1500));
           router.push(`/builder?id=${existingApps[0].id}`);
           return;
        }
      }
    } catch (err) {
      console.error("Error checking existing apps:", err);
    }

    // 3. Standard Flow (New Project)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const params = new URLSearchParams();
    params.set('url', fullUrl);
    if (previewIcon) params.set('icon', previewIcon);
    if (magicColor) params.set('color', magicColor);
    
    router.push(`/builder?${params.toString()}`);
  };

  const handleDemo = async () => {
    setIsLoading(true);
    setShowSplash(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    const params = new URLSearchParams();
    params.set('url', 'https://www.wikipedia.org');
    params.set('name', 'Wikipedia');
    params.set('color', '#000000'); 
    params.set('icon', 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/1200px-Wikipedia-logo-v2.svg.png');
    router.push(`/builder?${params.toString()}`);
  };

  return (
    <>
      {showSplash && <TransitionSplash />}
      <section className="relative z-10 w-full overflow-hidden flex flex-col justify-center items-center bg-black border-b border-white/5 h-[100svh] pt-20 lg:pt-32 lg:h-screen">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_1px)] [background-size:32px_32px] opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_100%)]"></div>
        </div>

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
                <div className="flex items-center gap-2 mb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <Layout size={14} className="text-zinc-500" />
                    <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">Enter Website URL</span>
                  </div>
                  {detectedDomain && (
                    <span className="text-[10px] text-emerald-500 font-bold animate-in fade-in flex items-center gap-2">
                      <span className="flex items-center gap-1"><Zap size={10} fill="currentColor" /> Analysis Ready</span>
                      {magicColor && <span className="h-2 w-2 rounded-full ring-1 ring-white/20 shadow-[0_0_8px_currentColor]" style={{ backgroundColor: magicColor, color: magicColor }}></span>}
                    </span>
                  )}
                </div>

                <div 
                  onClick={() => inputRef.current?.focus()}
                  className={`
                    relative flex items-center bg-black border transition-all duration-300 rounded-lg overflow-hidden cursor-text h-14
                    ${isInputFocused ? 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}
                  `}
                  style={{
                    borderColor: isInputFocused ? (magicColor || '#10b981') : undefined
                  }}
                >
                  <div className="h-full pl-3 pr-2 flex items-center justify-center bg-zinc-900/50 border-r border-white/5 mr-2 w-[52px] shrink-0">
                     {isIconLoading ? (
                        <div className="flex items-center justify-center">
                           <LoaderCircle size={18} className="text-zinc-500 animate-spin" />
                        </div>
                     ) : previewIcon ? (
                        <div className="relative h-7 w-7 rounded-lg bg-white p-0.5 animate-in zoom-in spin-in-3 duration-500 shadow-lg">
                           <img 
                             src={previewIcon} 
                             alt="Favicon" 
                             className="w-full h-full object-contain rounded-md"
                             onError={(e) => { e.currentTarget.style.display = 'none'; setPreviewIcon(null); }}
                           />
                        </div>
                     ) : (
                        <div className="h-7 w-7 rounded-lg bg-zinc-800 flex items-center justify-center">
                           <Globe size={16} className="text-zinc-500" />
                        </div>
                     )}
                  </div>
                  
                  <span className="text-zinc-600 font-mono text-sm select-none">https://</span>
                  
                  <input
                      ref={inputRef}
                      id="hero-input"
                      type="text"
                      value={url}
                      maxLength={2048} // Security: Max length limit
                      onChange={(e) => {
                        let val = e.target.value.toLowerCase();
                        // Security: Strip dangerous chars
                        val = val.replace(/[<>'"/]/g, '').replace(/^\s+/, '').replace(/^https?:\/\//, '');
                        setUrl(val);
                        if (error) setError('');
                      }}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      placeholder="myshop.com"
                      className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-700 focus:ring-0 p-0 outline-none w-full text-sm font-mono tracking-tight pl-1"
                      autoComplete="off"
                  />
                  
                  {url && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUrl('');
                          setIsUrlValid(false);
                          setDetectedDomain(null);
                          setPreviewIcon(null);
                          inputRef.current?.focus();
                        }}
                        className="mr-3 text-zinc-600 hover:text-zinc-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                  )}
                </div>

                <p className="mt-3 mb-6 text-[11px] text-zinc-500 font-mono pl-1 flex items-center gap-2 h-4">
                   {detectedDomain ? (
                      <span className="text-emerald-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                         <span style={{ color: magicColor }}>●</span> 
                         Ready to convert {detectedDomain}
                      </span>
                   ) : (
                      "Paste the full URL of your website to start."
                   )}
                </p>

                <Button
                  type="submit"
                  className={`
                    w-full h-12 bg-black text-white hover:bg-zinc-900 border border-transparent rounded-lg font-bold text-sm transition-all transform flex items-center justify-center gap-2
                    ${isUrlValid ? 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.01]' : 'opacity-70 cursor-not-allowed bg-zinc-800 text-zinc-500 border-zinc-700'}
                  `}
                  disabled={isLoading || !isUrlValid}
                  style={{
                    backgroundColor: isUrlValid ? (magicColor || '#000000') : undefined,
                    borderColor: isUrlValid ? 'rgba(255,255,255,0.1)' : undefined
                  }}
                >
                    <span>Build App</span>
                    <Box size={16} /> 
                </Button>

                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={isLoading}
                  className="w-full mt-3 h-11 rounded-lg border border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 text-xs font-mono transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Use Demo Website</span>
                </button>

                <div className="flex items-center justify-center gap-6 mt-6 border-t border-white/5 pt-4 opacity-80">
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-zinc-400">
                      <Code size={14} className="text-emerald-500" />
                      <span>No Code</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-zinc-400">
                      <AppWindow size={14} className="text-emerald-500" />
                      <span>APK Ready</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-zinc-400">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span>Secure</span>
                    </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center text-center">
                <div className="inline-flex items-center gap-2 text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 bg-red-950/50 px-3 py-1 rounded-full border border-red-900/50">
                  <AlertCircle size={16} /> {error}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="absolute inset-0 pointer-events-none select-none z-10">
          <div className="absolute left-1/2 -translate-x-1/2 w-[180vw] h-[65%] sm:h-[45%] bottom-0 bg-emerald-900/20 blur-[80px] rounded-t-[100%] z-0"></div>
          <div className="absolute left-1/2 -translate-x-1/2 z-10 w-[200vw] h-[200vh] top-[55%] sm:top-[45%]">
            <div className="absolute inset-0 rounded-[100%] bg-emerald-500/10 blur-[80px] animate-pulse"></div>
            <div className="absolute inset-[5%] rounded-[100%] bg-emerald-500/20 blur-[40px]"></div>
            <div className="absolute inset-[10%] rounded-[100%] bg-black overflow-hidden shadow-[0_-20px_100px_-10px_rgba(16,185,129,0.5),inset_0_20px_80px_10px_rgba(16,185,129,0.3)]">
                <div className="absolute inset-0 rounded-[100%] border-t-2 border-emerald-400/60 blur-[6px]"></div>
                <div className="absolute inset-0 rounded-[100%] border-t border-emerald-500/30 blur-[2px]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-emerald-950/20 to-black opacity-90"></div>
            </div>
          </div>
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent blur-[1px] z-20 top-[55%] sm:top-[45%]"></div>
        </div>
      </section>
    </>
  );
};
