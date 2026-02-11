
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
    Earth, FileJson, Cpu, Layers, Download, Check, Terminal, Command, 
    Share2, Activity, SmartphoneNfc, AppWindow, MessageSquare, ExternalLink, 
    ChevronLeft, ChevronRight, Code, Globe, Search, ShoppingBag, Home, LayoutGrid, User, Star
} from 'lucide-react';

// Shared Hooks
function useInView(options: IntersectionObserverInit = { threshold: 0.1, rootMargin: '0px' }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView] as const;
}

// ── 1. Transformation Demo (Phone Effect) ──

export const AppTransformationDemo = () => {
  const [isAppMode, setIsAppMode] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setIsAppMode(prev => !prev), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
      <section className="relative z-10 py-24 bg-black border-t border-zinc-900 overflow-hidden">
        <div className="max-w-5xl mx-auto flex flex-col items-center justify-center relative">
          
          <div className="text-center mb-10 relative z-20 px-4">
             <h2 className="text-3xl md:text-5xl font-black text-white mb-3 text-balance">Instant Native Evolution</h2>
             <p className="text-zinc-500 text-lg max-w-xl mx-auto text-balance">Watch your existing web content automatically adapt into a premium mobile app experience.</p>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative h-[450px] sm:h-[600px] w-full flex items-center justify-center z-10 overflow-visible">
            <div
              className={`
                relative bg-zinc-950 shadow-2xl transition-all duration-[800ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] border-zinc-800 overflow-hidden z-20 origin-top
                ${isAppMode
                  ? 'w-[240px] h-[480px] sm:w-[280px] sm:h-[550px] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px]'
                  : 'w-[90%] sm:w-[520px] h-[300px] sm:h-[350px] rounded-xl border-[1px] translate-y-8'
                }
              `}
            >
              <div className={`
                w-full transition-all duration-500 flex items-center px-4 relative z-20 bg-zinc-900
                ${isAppMode ? 'h-20 sm:h-24 pt-6 sm:pt-8 items-end text-white' : 'h-10 border-b border-zinc-800'}
              `}>
                <div className={`flex items-center gap-2 w-full absolute top-1/2 -translate-y-1/2 left-4 transition-opacity duration-300 ${isAppMode ? 'opacity-0 delay-0' : 'opacity-100 delay-300'}`}>
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700"></div>
                  </div>
                  <div className="flex-1 mx-4 h-6 bg-black border border-zinc-800 rounded flex items-center px-2 text-[10px] text-zinc-500 font-mono">
                    <Globe size={10} className="mr-1" /> myshop.com
                  </div>
                </div>

                <div className={`w-full flex justify-between items-center pb-2 transition-all duration-300 ${isAppMode ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-2 delay-0'}`}>
                  <div className="font-bold text-base sm:text-lg text-white">MyShop</div>
                  <div className="flex gap-3 text-zinc-400">
                    <Search size={18} />
                    <ShoppingBag size={18} />
                  </div>
                </div>
              </div>

              <div className="bg-black w-full h-full p-4 relative overflow-hidden overflow-y-auto no-scrollbar">
                <div className={`
                  rounded-lg mb-4 transition-all duration-500 overflow-hidden relative border border-zinc-800 bg-zinc-900 group
                  ${isAppMode ? 'h-32 sm:h-40' : 'h-24 sm:h-32'}
                `}>
                  <Image 
                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80" 
                    fill
                    priority // Forces preload to prevent lag
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" 
                    alt="Shoes"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-white font-bold text-lg sm:text-xl drop-shadow-md">New Arrivals</span>
                    <button className="mt-2 bg-white text-black text-[10px] px-3 py-1 rounded-full font-bold">Shop Now</button>
                  </div>
                </div>

                <div className={`
                  grid gap-3 transition-all duration-500
                  ${isAppMode ? 'grid-cols-2' : 'grid-cols-3'}
                `}>
                  {[
                    { title: "Nike Air", price: "$129", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80" },
                    { title: "Watch", price: "$399", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80" },
                    { title: "Bag", price: "$89", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=300&q=80" },
                    { title: "Glasses", price: "$150", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&q=80" },
                  ].map((item, i) => (
                    <div key={i} className="space-y-2 group">
                      <div className="aspect-square bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden relative">
                         <Image 
                            src={item.img} 
                            alt={item.title} 
                            fill 
                            priority // Forces preload to prevent lag
                            sizes="(max-width: 768px) 50vw, 20vw"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                         />
                      </div>
                      <div className="px-1">
                        <div className="h-3 w-full flex items-center justify-between">
                           <span className="text-[10px] font-bold text-zinc-300">{item.title}</span>
                           <span className="text-[10px] text-zinc-500">{item.price}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                           {[1,2,3,4,5].map(s => <Star key={s} size={6} className="text-zinc-600 fill-zinc-600" />)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`
                absolute bottom-0 left-0 right-0 h-14 sm:h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-around text-zinc-500 transition-transform duration-500
                ${isAppMode ? 'translate-y-0' : 'translate-y-full'}
              `}>
                <div className="flex flex-col items-center gap-1 text-white">
                  <Home size={18} />
                  <span className="text-[10px] font-medium">Home</span>
                </div>
                <div className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                  <LayoutGrid size={18} />
                  <span className="text-[10px] font-medium">Cat.</span>
                </div>
                <div className="flex flex-col items-center gap-1 hover:text-white transition-colors">
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
  );
};

// ── 2. Bridge Showcase (Carousel) ──

export const BridgeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const features = [
    { title: "Native Share API", desc: "Allow users to share content from your site directly to native apps like WhatsApp, Telegram, or Email.", icon: Share2, useCases: ["Product sharing", "Article distribution", "Invite friends", "Social media integration"], code: `window.web2app.share({\n  text: 'Check out this amazing site!',\n  url: 'https://yourwebsite.com'\n});` },
    { title: "Haptic Feedback API", desc: "Engage users physically by triggering the device's vibration engine for tactile feedback.", icon: Activity, useCases: ["Button click confirmation", "Success notifications", "Game interactions", "Error alerts"], code: `// Simple vibration\nwindow.web2app.vibrate({ duration: 200 });\n\n// Complex pattern\nwindow.web2app.vibrate({ \n  pattern: [0, 100, 50, 200] \n});` },
    { title: "Device Info API", desc: "Access detailed information about the user's device model, OS version, and manufacturer.", icon: SmartphoneNfc, useCases: ["Device-specific optimization", "User analytics", "Tech support logging", "Feature gating"], code: `const info = await window.web2app.getDeviceInfo();\n\nconsole.log(info.model); // "iPhone 15 Pro"\nconsole.log(info.platform); // "iOS"\nconsole.log(info.version); // "17.4"` },
    { title: "App Info API", desc: "Retrieve metadata about the installed application wrapper itself.", icon: AppWindow, useCases: ["Version checking", "Displaying 'About' info", "Update prompts", "Package name verification"], code: `const info = await window.web2app.getAppInfo();\n\n// Returns object with:\n// name, version, buildNumber, packageName` },
    { title: "Native Toast API", desc: "Display non-intrusive, native Android-style toast messages at the bottom of the screen.", icon: MessageSquare, useCases: ["Success messages", "Brief warnings", "System status updates", "Action feedback"], code: `window.web2app.toast('Saved successfully!');\n\n// Or with duration\nwindow.web2app.toast('Processing...', 'long');` },
    { title: "Open External API", desc: "Force specific URLs to open in the system default browser instead of the in-app webview.", icon: ExternalLink, useCases: ["Support pages", "Legal documents", "Social media profiles", "Third-party auth"], code: `window.web2app.openExternal('https://google.com');` }
  ];

  const handleNext = () => { setActiveIndex((prev) => (prev + 1) % features.length); resetAutoPlay(); };
  const handlePrev = () => { setActiveIndex((prev) => (prev - 1 + features.length) % features.length); resetAutoPlay(); };
  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => { setActiveIndex((prev) => (prev + 1) % features.length); }, 5000);
  };

  useEffect(() => { resetAutoPlay(); return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); }; }, []);

  const activeFeature = features[activeIndex];

  return (
    <section className="py-24 bg-zinc-950 border-t border-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400 text-xs font-mono font-bold tracking-wider mb-4">
            <Code size={14} /> JS BRIDGE V2.0
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">JavaScript Bridge APIs</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
             Your website isn't just displayed; it's upgraded. Access native device capabilities directly from your existing JavaScript code.
          </p>
        </div>
        <div className="relative">
          <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[420px] transition-all duration-500 relative z-20">
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 relative bg-zinc-900/30">
               <div>
                  <div className="h-12 w-12 bg-zinc-800 rounded-xl flex items-center justify-center text-emerald-400 mb-6 border border-zinc-700 shadow-lg"><activeFeature.icon size={24} /></div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{activeFeature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed mb-8 h-20">{activeFeature.desc}</p>
                  <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block">Common Use Cases</span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                       {activeFeature.useCases.map((useCase, idx) => (<li key={idx} className="flex items-center gap-2 text-sm text-zinc-300"><div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>{useCase}</li>))}
                    </ul>
                  </div>
               </div>
            </div>
            <div className="w-full md:w-1/2 bg-[#0d1117] p-6 md:p-8 flex flex-col relative font-mono text-sm group">
               <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-4">
                  <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div><div className="w-3 h-3 rounded-full bg-[#febc2e]"></div><div className="w-3 h-3 rounded-full bg-[#28c840]"></div></div>
                  <span className="text-xs text-zinc-600">bridge-implementation.js</span>
               </div>
               <div className="flex-1 overflow-auto custom-scrollbar relative">
                   <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                   <pre className="text-zinc-300 leading-relaxed whitespace-pre-wrap pt-4"><code dangerouslySetInnerHTML={{ __html: activeFeature.code.replace(/window|await|const/g, '<span class="text-purple-400">$&</span>').replace(/web2app/g, '<span class="text-emerald-400">web2app</span>').replace(/'[^']*'/g, '<span class="text-amber-300">$&</span>').replace(/\/\/.*/g, '<span class="text-zinc-500">$&</span>').replace(/[{}()]/g, '<span class="text-zinc-500">$&</span>') }} /></pre>
               </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-8">
             <div className="flex gap-2">{features.map((_, idx) => (<button key={idx} onClick={() => { setActiveIndex(idx); resetAutoPlay(); }} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-800 hover:bg-zinc-700'}`} />))}</div>
             <div className="flex gap-2"><button onClick={handlePrev} className="p-3 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><ChevronLeft size={20} /></button><button onClick={handleNext} className="p-3 rounded-full border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"><ChevronRight size={20} /></button></div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── 3. Pipeline Flow ──

const AnimatedLine = ({ active, vertical = false, height = 'h-12', width = 'w-full', className = '' }: { active: boolean; vertical?: boolean; height?: string; width?: string; className?: string; }) => (
  <div className={`relative bg-zinc-900 overflow-hidden ${vertical ? `w-[2px] ${height}` : `h-[2px] ${width}`} ${className}`}>
    <div className={`absolute bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-700 ease-out ${vertical ? `top-0 left-0 w-full ${active ? 'h-full' : 'h-0'}` : `top-0 left-0 h-full ${active ? 'w-full' : 'w-0'}`}`} />
  </div>
);

const PipelineNode = ({ icon: Icon, title, subtitle, isActive, isCompleted, delay = 0, position = 'center' }: { icon: any; title: string; subtitle: string; isActive: boolean; isCompleted: boolean; delay?: number; position?: 'left' | 'right' | 'center'; }) => (
  <div className={`relative flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all duration-500 z-20 ${position === 'center' ? 'w-64' : 'w-[160px] sm:w-64'} ${isActive || isCompleted ? 'bg-black/80 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)]' : 'bg-black/40 border-zinc-800/50 opacity-50 grayscale'}`} style={{ transitionDelay: `${delay}ms` }}>
    {(isActive || isCompleted) && (<><div className="absolute -top-px -left-px w-2 h-2 border-t border-l border-emerald-500"></div><div className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-emerald-500"></div></>)}
    <div className={`h-10 w-10 shrink-0 rounded-md flex items-center justify-center transition-all duration-500 border ${isCompleted ? 'bg-transparent border-transparent text-emerald-500' : isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>{isCompleted ? <Check size={24} strokeWidth={3} /> : <Icon size={20} />}</div>
    <div className="flex flex-col min-w-0 flex-1"><span className={`text-[10px] sm:text-sm font-bold leading-tight transition-colors duration-300 font-mono whitespace-normal ${isActive || isCompleted ? 'text-emerald-50 text-shadow-sm' : 'text-zinc-600'}`}>{title}</span><span className="text-[9px] sm:text-[10px] text-zinc-500 font-mono leading-tight whitespace-normal mt-0.5">{isActive && !isCompleted ? 'Processing...' : subtitle}</span></div>
  </div>
);

export const PipelineFlow = () => {
  const [step, setStep] = useState(0);
  const [ref, isInView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (!isInView) { setStep(0); return; }
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const loop = () => {
      setStep(0);
      timeouts.push(setTimeout(() => setStep(1), 500));
      timeouts.push(setTimeout(() => setStep(2), 1500));
      timeouts.push(setTimeout(() => setStep(3), 2000));
      timeouts.push(setTimeout(() => setStep(4), 3000));
      timeouts.push(setTimeout(() => setStep(5), 3500));
      timeouts.push(setTimeout(() => setStep(6), 5500));
      timeouts.push(setTimeout(() => setStep(7), 6000));
      timeouts.push(setTimeout(loop, 9000));
    };
    loop();
    return () => timeouts.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={ref} className="flex flex-col items-center justify-center py-10 w-full max-w-3xl mx-auto relative select-none">
      <div className="z-10"><PipelineNode icon={Earth} title="Website Source" subtitle="https://myshop.com" isActive={step >= 1} isCompleted={step >= 2} /></div>
      <AnimatedLine active={step >= 2} vertical height="h-12" />
      <div className="z-10"><PipelineNode icon={FileJson} title="Smart Config" subtitle="Manifest generation" isActive={step >= 3} isCompleted={step >= 4} /></div>
      <div className="relative w-full max-w-[340px] sm:max-w-[540px] flex flex-col items-center">
         <AnimatedLine active={step >= 4} vertical height="h-6" />
         <div className="w-[calc(100%-160px)] sm:w-[calc(100%-16rem)]"><AnimatedLine active={step >= 4} /></div>
         <div className="flex justify-between w-full"><div className="w-[160px] sm:w-64 flex justify-center"><AnimatedLine active={step >= 4} vertical height="h-6" /></div><div className="w-[160px] sm:w-64 flex justify-center"><AnimatedLine active={step >= 4} vertical height="h-6" /></div></div>
      </div>
      <div className="flex justify-between w-full z-10 gap-0 max-w-[340px] sm:max-w-[540px]">
        <div className="flex justify-center w-[160px] sm:w-64"><PipelineNode icon={Cpu} title="Android Build" subtitle="Gradle Assembly" isActive={step >= 5} isCompleted={step >= 6} position="left" /></div>
        <div className="flex justify-center w-[160px] sm:w-64"><PipelineNode icon={Layers} title="iOS Build" subtitle="Xcode Compilation" isActive={step >= 5} isCompleted={step >= 6} position="right" /></div>
      </div>
      <div className="relative w-full max-w-[340px] sm:max-w-[540px] flex flex-col items-center">
        <div className="flex justify-between w-full"><div className="w-[160px] sm:w-64 flex justify-center"><AnimatedLine active={step >= 6} vertical height="h-6" /></div><div className="w-[160px] sm:w-64 flex justify-center"><AnimatedLine active={step >= 6} vertical height="h-6" /></div></div>
        <div className="w-[calc(100%-160px)] sm:w-[calc(100%-16rem)] relative"><div className="h-[2px] bg-zinc-900 w-full relative overflow-hidden"><div className={`absolute left-0 top-0 h-full bg-emerald-500 transition-all duration-500 ${step >= 6 ? 'w-1/2' : 'w-0'}`}></div><div className={`absolute right-0 top-0 h-full bg-emerald-500 transition-all duration-500 ${step >= 6 ? 'w-1/2' : 'w-0'}`}></div></div></div>
        <AnimatedLine active={step >= 6} vertical height="h-6" />
      </div>
      <div className="z-10"><PipelineNode icon={Download} title="Distribution Ready" subtitle="APK & IPA Signed" isActive={step >= 7} isCompleted={step >= 7} /></div>
    </div>
  );
};

// ── 4. Interactive Terminal ──

export const InteractiveTerminal = () => {
  const [lines, setLines] = useState<{ text: string; color?: string; id: number }[]>([]);
  const [ref, isInView] = useInView({ threshold: 0.2 });

  useEffect(() => {
    if (!isInView) { setLines([]); return; }
    const sequence = [{ text: "user@dev:~$ web2app analyze --url https://myshop.com", color: "text-white", delay: 0 }, { text: "→ Initializing build environment...", color: "text-zinc-500", delay: 800 }, { text: "→ Resolving DNS for myshop.com...", color: "text-zinc-500", delay: 1400 }, { text: "✓ Connection established (Latency: 24ms)", color: "text-emerald-400", delay: 2000 }, { text: "[scraper] Parsing DOM structure...", color: "text-blue-400", delay: 2800 }, { text: " ├─ Found <title>: My Awesome Shop", color: "text-zinc-300", delay: 3200 }, { text: " ├─ Detected theme-color: #000000", color: "text-zinc-300", delay: 3500 }, { text: " └─ Extracted high-res icon (192x192)", color: "text-zinc-300", delay: 3800 }, { text: "[native] Generating AndroidManifest.xml...", color: "text-purple-400", delay: 4500 }, { text: "[native] Injecting WebView Javascript Bridge...", color: "text-purple-400", delay: 5000 }, { text: "[build] Compiling resources...", color: "text-yellow-400", delay: 5800 }, { text: "✓ Signed APK generated: app-release.apk (14MB)", color: "text-emerald-400 font-bold", delay: 6800 }, { text: "user@dev:~$ _", color: "text-white animate-pulse", delay: 7500 }];
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    let interval: ReturnType<typeof setInterval>;
    const runSequence = () => {
      setLines([]); timeouts.forEach(clearTimeout); timeouts = [];
      sequence.forEach(({ text, color, delay }, index) => { timeouts.push(setTimeout(() => { setLines(prev => index === 0 ? [{ text, color, id: index }] : [...prev, { text, color, id: index }]); }, delay)); });
    };
    runSequence();
    interval = setInterval(runSequence, 9000);
    return () => { clearInterval(interval); timeouts.forEach(clearTimeout); };
  }, [isInView]);

  return (
    <div ref={ref} className="flex flex-col gap-12 lg:gap-16 items-center max-w-4xl mx-auto">
      <div className="space-y-6 lg:space-y-8 text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 text-emerald-400 border border-emerald-900/50 text-xs font-mono font-bold tracking-wider mb-2 mx-auto"><Terminal size={14} /> AUTOMATED PIPELINE</div>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] text-balance">Engineering power,<br /><span className="text-zinc-600">zero code required.</span></h3>
        <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto text-balance">We abstracted the entire React Native build pipeline into a simple URL input. What typically takes a development team weeks to configure, our engine processes in seconds.</p>
      </div>
      <div className="relative group w-full max-w-2xl px-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-600/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative w-full bg-[#0d1117] rounded-xl overflow-hidden shadow-2xl border border-zinc-800 font-mono text-xs md:text-sm h-[360px] flex flex-col">
          <div className="bg-[#161b22] px-4 py-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div><div className="w-3 h-3 rounded-full bg-[#febc2e]"></div><div className="w-3 h-3 rounded-full bg-[#28c840]"></div></div>
            <div className="flex items-center gap-2 text-zinc-500"><Command size={12} /><span>builder-cli — zsh</span></div><div className="w-10"></div>
          </div>
          <div className="p-4 md:p-6 flex-1 overflow-hidden flex flex-col justify-end pb-8">
            <div className="space-y-2 font-mono text-left">{lines.map((line) => (<div key={line.id} className={`${line.color} break-all animate-in fade-in duration-500 slide-in-from-bottom-2`}>{line.text}</div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
