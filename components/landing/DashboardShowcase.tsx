
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Palette, Smartphone, Settings, Layout, ToggleRight, CheckCircle2, Zap
} from 'lucide-react';

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

export const DashboardShowcase = () => {
  const [ref, isInView] = useInView({ threshold: 0.2 });

  return (
    <section className="py-24 bg-black relative overflow-hidden perspective-1000">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight text-balance">
            Complete Customization.<br />
            <span className="text-zinc-500">Instant Updates.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto text-balance">
            Control your app's look and feel directly from the dashboard. Toggle native features, adjust branding colors, and configure navigation without touching a single line of code.
          </p>
        </div>

        {/* 3D Dashboard Container */}
        <div 
          ref={ref}
          className={`
            relative w-full max-w-5xl mx-auto transition-all duration-1000 ease-out transform-gpu
            ${isInView ? 'opacity-100 translate-y-0 rotate-x-12' : 'opacity-0 translate-y-20 rotate-x-0'}
          `}
          style={{ perspective: '2000px' }}
        >
          {/* The Dashboard Card */}
          <div className="
            relative bg-[#09090b] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden
            transform md:rotateX-[10deg] md:scale-[0.95] transition-transform duration-700
            shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-t-zinc-700
          ">
            {/* Glossy Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-20"></div>

            {/* Browser Chrome / Header */}
            <div className="h-12 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 flex items-center px-4 justify-between">
               <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
               </div>
               <div className="h-6 w-64 bg-zinc-800 rounded-md flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                  dashboard.web2app.com
               </div>
               <div className="w-10"></div>
            </div>

            {/* Dashboard Content Layout */}
            <div className="flex h-[500px] md:h-[600px] relative z-10">
               
               {/* Sidebar */}
               <div className="w-16 md:w-64 bg-zinc-900/30 border-r border-zinc-800 flex flex-col p-4 gap-2 shrink-0 items-center md:items-stretch">
                  <div className="h-10 w-10 md:w-full bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center justify-center md:justify-start md:px-3 text-emerald-400 mb-6 shrink-0">
                     <div className="h-6 w-6 bg-emerald-500 rounded flex items-center justify-center text-black font-bold text-xs">W</div>
                     <span className="hidden md:inline text-sm font-bold ml-2">Web2App</span>
                  </div>
                  
                  {[
                    { icon: Layout, label: 'General', active: false },
                    { icon: Palette, label: 'Design', active: true },
                    { icon: ToggleRight, label: 'Features', active: false },
                    { icon: Smartphone, label: 'Builds', active: false },
                    { icon: Settings, label: 'Settings', active: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-default ${item.active ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
                       <item.icon size={18} />
                       <span className="hidden md:inline">{item.label}</span>
                    </div>
                  ))}
               </div>

               {/* Main Content Area */}
               <div className="flex-1 bg-[#09090b] p-6 md:p-8 overflow-hidden flex flex-col gap-6">
                  
                  {/* Top Section: Branding Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Theme Color Card */}
                     <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                           <h4 className="text-white font-bold text-sm flex items-center gap-2"><Palette size={16} className="text-emerald-500" /> Brand Color</h4>
                           <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">#10B981</span>
                        </div>
                        <div className="flex gap-3">
                           {['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6'].map((color, i) => (
                              <div key={i} className={`h-8 w-8 rounded-full cursor-pointer ring-2 ring-offset-2 ring-offset-[#09090b] ${i === 0 ? 'ring-white scale-110' : 'ring-transparent opacity-50'}`} style={{ backgroundColor: color }}></div>
                           ))}
                        </div>
                     </div>

                     {/* Navigation Config Card */}
                     <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 flex flex-col gap-4">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2"><Layout size={16} className="text-blue-500" /> Navigation Style</h4>
                        <div className="flex gap-2">
                           <div className="flex-1 h-12 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center gap-2 text-xs text-zinc-300">
                              <div className="w-3 h-3 bg-zinc-600 rounded-sm"></div> Native
                           </div>
                           <div className="flex-1 h-12 bg-emerald-900/20 border border-emerald-500/50 rounded-lg flex items-center justify-center gap-2 text-xs text-emerald-400 font-bold">
                              <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Tab Bar
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Main Feature Toggles */}
                  <div className="flex-1 rounded-xl bg-zinc-900/30 border border-zinc-800 p-6 relative overflow-hidden">
                     <h3 className="text-white font-bold flex items-center gap-2 mb-6"><Zap size={16} className="text-amber-500"/> App Features</h3>
                     
                     <div className="space-y-4">
                        {[
                           { name: 'Pull to Refresh', desc: 'Allow users to swipe down to reload content', active: true },
                           { name: 'Biometric Authentication', desc: 'Secure app with FaceID / TouchID', active: true },
                           { name: 'Push Notifications', desc: 'Enable remote notifications via Firebase', active: true },
                           { name: 'Keep Awake', desc: 'Prevent screen from dimming while active', active: false },
                        ].map((feature, i) => (
                           <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="flex items-start gap-3">
                                 <div className={`mt-1 h-4 w-4 rounded-full border flex items-center justify-center ${feature.active ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'}`}>
                                    {feature.active && <CheckCircle2 size={10} className="text-black" />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-zinc-200">{feature.name}</p>
                                    <p className="text-xs text-zinc-500">{feature.desc}</p>
                                 </div>
                              </div>
                              <div className={`w-10 h-5 rounded-full relative transition-colors ${feature.active ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${feature.active ? 'left-6' : 'left-1'}`}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
