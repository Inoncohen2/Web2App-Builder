
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, X, Lock, Layout, Code, AppWindow, ShieldCheck, Box, CircleAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import axios from 'axios';

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
          Extracting metadata, icons, and theme configuration...
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

export const Hero = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [error, setError] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);

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

    const cleanedUrl = url.trim().replace(/^https?:\/\//, '');
    const fullUrl = `https://${cleanedUrl}`;
    
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\\#[-a-z\\d_]*)?$',
      'i'
    );

    if (!urlPattern.test(fullUrl)) {
      setError('Please enter a valid URL (e.g. myshop.com)');
      return;
    }

    setIsLoading(true);
    setShowSplash(true);

    const timerPromise = new Promise(resolve => setTimeout(resolve, 3100));

    try {
      const dataPromise = axios.post('/api/scrape', { url: fullUrl });
      const [_, response] = await Promise.all([timerPromise, dataPromise]);
      const data = response.data;

      const params = new URLSearchParams();
      params.set('url', data.url || fullUrl);
      if (data.title) params.set('name', data.title);
      if (data.themeColor) params.set('color', data.themeColor);
      if (data.icon) params.set('icon', data.icon);
      
      // Pass extracted legal URLs to builder
      if (data.privacyPolicyUrl) params.set('privacy', data.privacyPolicyUrl);
      if (data.termsOfServiceUrl) params.set('terms', data.termsOfServiceUrl);
      
      router.push(`/builder?${params.toString()}`);
      
    } catch (err) {
      console.error('Analysis failed, proceeding with raw URL', err);
      await timerPromise;
      const params = new URLSearchParams();
      params.set('url', fullUrl);
      router.push(`/builder?${params.toString()}`);
    }
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
    // Demo URLs (optional)
    params.set('privacy', 'https://foundation.wikimedia.org/wiki/Policy:Privacy_policy');
    params.set('terms', 'https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use');
    
    router.push(`/builder?${params.toString()}`);
  };

  return (
    <>
      {showSplash && <TransitionSplash />}
      <section className="relative z-10 w-full overflow-hidden flex flex-col justify-center items-center bg-black border-b border-white/5 h-[100svh] pt-20 lg:h-screen">
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
                <div className="flex items-center gap-2 mb-3">
                  <Layout size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">Enter Website URL</span>
                </div>

                <div 
                  onClick={() => inputRef.current?.focus()}
                  className={`
                    relative flex items-center bg-black border transition-all duration-300 rounded-lg overflow-hidden cursor-text h-14
                    ${isInputFocused ? 'border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]' : 'border-zinc-800 hover:border-zinc-700'}
                  `}
                >
                  <div className="h-full w-1.5 bg-zinc-800 mr-3"></div>
                  
                  <span className="text-zinc-600 font-mono text-sm select-none mr-1">https://</span>
                  
                  <input
                      ref={inputRef}
                      id="hero-input"
                      type="text"
                      value={url}
                      onChange={(e) => {
                        let val = e.target.value.toLowerCase();
                        val = val.replace(/^\s+/, '').replace(/^https?:\/\//, '');
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

                <p className="mt-3 mb-6 text-[11px] text-zinc-500 font-mono pl-1">
                   Paste the full URL of your website to start the conversion process.
                </p>

                <Button
                  type="submit"
                  className={`
                    w-full h-12 bg-black text-white hover:bg-zinc-900 border border-transparent rounded-lg font-bold text-sm transition-all transform flex items-center justify-center gap-2
                    ${isUrlValid ? 'shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-[1.01]' : 'opacity-70 cursor-not-allowed bg-zinc-800 text-zinc-500 border-zinc-700'}
                  `}
                  disabled={isLoading || !isUrlValid}
                >
                    <span>Build</span>
                    <Box size={16} /> 
                </Button>

                <button
                  type="button"
                  onClick={handleDemo}
                  disabled={isLoading}
                  className="w-full mt-3 h-11 rounded-lg border border-dashed border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 text-xs font-mono transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Demo</span>
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
                  <CircleAlert size={16} /> {error}
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
