
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  Bell, BarChart3, Users, Smartphone, Settings, 
  Send, MousePointer2, TrendingUp, MoreHorizontal 
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
            Total Control.<br />
            <span className="text-zinc-500">Zero Complications.</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Manage your entire mobile presence from one beautiful dashboard. Send push notifications, track installs, and update configurations instantly.
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
               <div className="w-20 md:w-64 bg-zinc-900/30 border-r border-zinc-800 flex flex-col p-4 gap-2 shrink-0">
                  <div className="h-10 w-full bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-3 px-3 text-emerald-400 mb-6">
                     <div className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center text-black font-bold text-xs">W</div>
                     <span className="hidden md:inline text-sm font-bold">Web2App</span>
                  </div>
                  
                  {[
                    { icon: BarChart3, label: 'Overview', active: true },
                    { icon: Bell, label: 'Push Campaigns', active: false },
                    { icon: Users, label: 'Audience', active: false },
                    { icon: Smartphone, label: 'App Settings', active: false },
                    { icon: Settings, label: 'Configuration', active: false },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                       <item.icon size={18} />
                       <span className="hidden md:inline">{item.label}</span>
                    </div>
                  ))}
               </div>

               {/* Main Content Area */}
               <div className="flex-1 bg-[#09090b] p-6 md:p-8 overflow-hidden flex flex-col gap-6">
                  
                  {/* Top Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                           <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Smartphone size={16} /></div>
                           <span className="text-xs font-mono text-zinc-500">+12%</span>
                        </div>
                        <div className="text-2xl font-bold text-white">24.5k</div>
                        <div className="text-xs text-zinc-500">Total Installs</div>
                     </div>
                     <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                           <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Users size={16} /></div>
                           <span className="text-xs font-mono text-emerald-500">+8%</span>
                        </div>
                        <div className="text-2xl font-bold text-white">18.2k</div>
                        <div className="text-xs text-zinc-500">Active Users</div>
                     </div>
                     <div className="hidden md:block p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                        <div className="flex justify-between items-start mb-2">
                           <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Bell size={16} /></div>
                           <span className="text-xs font-mono text-zinc-500">2h ago</span>
                        </div>
                        <div className="text-2xl font-bold text-white">89%</div>
                        <div className="text-xs text-zinc-500">Push Open Rate</div>
                     </div>
                  </div>

                  {/* Main Chart Section */}
                  <div className="flex-1 rounded-xl bg-zinc-900/30 border border-zinc-800 p-6 relative overflow-hidden group">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500"/> Engagement Growth</h3>
                        <div className="flex gap-2">
                           <div className="h-6 w-20 bg-zinc-800 rounded text-[10px] flex items-center justify-center text-zinc-400">Last 30 Days</div>
                        </div>
                     </div>
                     
                     {/* CSS Chart Simulation */}
                     <div className="absolute bottom-0 left-0 right-0 h-[200px] flex items-end justify-between px-6 pb-6 gap-2 opacity-80">
                        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95, 70, 60, 100].map((h, i) => (
                           <div key={i} className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-all duration-300 rounded-t-sm relative group/bar" style={{ height: `${h}%` }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                 {h * 12}
                              </div>
                           </div>
                        ))}
                     </div>
                     
                     {/* SVG Line Overlay */}
                     <svg className="absolute bottom-6 left-6 right-6 h-[200px] w-[calc(100%-48px)] overflow-visible" preserveAspectRatio="none">
                        <path 
                           d="M0,200 L0,120 L50,70 L100,110 L150,40 L200,90 L250,60 L300,20 L350,80 L400,50 L450,100 L500,10 L550,60 L600,80 L650,0 L650,200 Z" 
                           fill="url(#gradient)" 
                           className="opacity-20"
                        />
                        <path 
                           d="M0,120 L50,70 L100,110 L150,40 L200,90 L250,60 L300,20 L350,80 L400,50 L450,100 L500,10 L550,60 L600,80 L650,0" 
                           fill="none" 
                           stroke="#10b981" 
                           strokeWidth="3"
                           className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        />
                        <defs>
                           <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                           </linearGradient>
                        </defs>
                     </svg>
                  </div>

                  {/* Floating Action Card (Push Notification) */}
                  <div className="absolute bottom-8 right-8 w-72 bg-[#1A1A1A] border border-zinc-700 rounded-xl shadow-2xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
                     <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5"><Bell size={12} className="text-emerald-400" /> New Campaign</span>
                        <MoreHorizontal size={14} className="text-zinc-500" />
                     </div>
                     <div className="space-y-2 mb-4">
                        <div className="h-2 w-12 bg-zinc-800 rounded-full"></div>
                        <div className="text-xs text-zinc-300 bg-zinc-900 p-2 rounded border border-zinc-800">
                           🔥 Flash Sale: 50% Off everything!
                        </div>
                     </div>
                     <button className="w-full bg-white text-black text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                        <Send size={12} /> Send Now
                     </button>
                     
                     {/* Fake Cursor */}
                     <div className="absolute -bottom-6 -right-6 text-white drop-shadow-lg animate-bounce">
                        <MousePointer2 size={24} fill="white" className="text-black" />
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
