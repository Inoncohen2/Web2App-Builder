
'use client';

import React from 'react';
import { 
  TrendingUp, DollarSign, Bell, Check, X
} from 'lucide-react';

export const GrowthShowcase = () => {
  return (
    <section className="bg-black relative overflow-hidden py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-32">
        
        {/* --- PART 1: MONETIZATION & RETENTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           
           {/* Text Side */}
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-900/50 text-emerald-500 text-xs font-mono font-bold tracking-wider">
                <TrendingUp size={14} /> ROI FOCUSED
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Turn traffic into <br/>
                <span className="text-emerald-500">Revenue Streams.</span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed text-balance">
                A mobile app isn't just a copy of your site; it's a powerful marketing channel. Keep users engaged with Push Notifications and monetize traffic with native ads.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3 text-emerald-400 font-bold">
                       <div className="p-2 bg-emerald-500/10 rounded-lg"><Bell size={18} /></div>
                       <span>Retention</span>
                    </div>
                    <p className="text-sm text-zinc-500">Send unlimited push notifications to bring users back instantly. 300% higher engagement than email.</p>
                 </div>
                 <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3 text-blue-400 font-bold">
                       <div className="p-2 bg-blue-500/10 rounded-lg"><DollarSign size={18} /></div>
                       <span>AdMob Ready</span>
                    </div>
                    <p className="text-sm text-zinc-500">Easily integrate Google AdMob banners and interstitials to generate passive income.</p>
                 </div>
              </div>
           </div>

           {/* Visual Side (Mockup Graph) */}
           <div className="relative w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-40"></div>
              <div className="relative bg-[#0B0F17] border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-end">
                 
                 {/* Fake Notification Pop */}
                 <div className="absolute top-4 right-4 sm:top-8 sm:right-[-20px] bg-zinc-800/90 backdrop-blur-md border border-zinc-700 p-3 rounded-l-xl rounded-r-xl sm:rounded-r-none shadow-xl z-20 w-auto sm:w-64 animate-in slide-in-from-right duration-1000 delay-500 max-w-[90%]">
                    <div className="flex gap-3">
                       <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center shrink-0 border border-zinc-600">
                          <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" className="h-6 w-6" alt="Icon" />
                       </div>
                       <div className="min-w-0">
                          <div className="flex justify-between items-center w-full gap-2">
                             <span className="text-[10px] font-bold text-white truncate">Your App</span>
                             <span className="text-[9px] text-zinc-500 shrink-0">now</span>
                          </div>
                          <p className="text-xs text-zinc-300 mt-0.5 leading-tight truncate">Flash Sale! 50% Off ends soon 🚀</p>
                       </div>
                    </div>
                 </div>

                 {/* Graph Visual */}
                 <div className="relative w-full h-[200px] mt-12 sm:mt-8">
                    {/* SVG Line */}
                    <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 300">
                       <path 
                         d="M0 250 C 100 250, 150 150, 250 180 S 350 50, 500 20" 
                         fill="none" 
                         stroke="#10b981" 
                         strokeWidth="3"
                         className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                       />
                       <path 
                         d="M0 250 C 100 250, 150 150, 250 180 S 350 50, 500 20 V 300 H 0 Z" 
                         fill="url(#growthGradient)" 
                         className="opacity-20"
                       />
                       <defs>
                          <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#10b981" stopOpacity="0.5"/>
                             <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                          </linearGradient>
                       </defs>
                    </svg>
                    
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-zinc-700 font-mono py-2">
                       <div className="border-t border-zinc-800/50 w-full pl-2">10k Users</div>
                       <div className="border-t border-zinc-800/50 w-full pl-2">5k Users</div>
                       <div className="border-t border-zinc-800/50 w-full pl-2">1k Users</div>
                       <div className="border-t border-zinc-800/50 w-full pl-2">0</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* --- PART 2: COMPARISON TABLE (Mobile Responsive) --- */}
        <div className="flex flex-col items-center">
           <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why choose Web2App?</h2>
              <p className="text-zinc-400">Comparing native development vs generic wrappers.</p>
           </div>

           <div className="w-full">
              <div className="w-full bg-[#0B0F17] border border-zinc-800 rounded-2xl overflow-hidden">
                 {/* Header Row */}
                 <div className="grid grid-cols-3 md:grid-cols-4 bg-zinc-900/50 border-b border-zinc-800 text-xs md:text-sm font-bold text-zinc-400">
                    <div className="p-3 md:p-6">Feature</div>
                    <div className="p-3 md:p-6 text-center text-red-400">Custom Dev</div>
                    <div className="hidden md:block p-6 text-center text-yellow-400">Other Wrappers</div>
                    <div className="p-3 md:p-6 text-center text-emerald-400 bg-emerald-900/10 border-b-2 border-emerald-500">Web2App</div>
                 </div>

                 {/* Rows */}
                 {[
                    { name: 'Cost', dev: '$15k+', other: '$500+', us: '$0 Start' },
                    { name: 'Time', dev: '3 Months', other: '2 Days', us: '15 Mins' },
                    { name: 'Push Notif', dev: <Check size={16} />, other: <X size={16} />, us: <Check size={16} /> },
                    { name: 'Native Nav', dev: <Check size={16} />, other: <X size={16} />, us: <Check size={16} /> },
                    { name: 'Offline', dev: <Check size={16} />, other: <X size={16} />, us: <Check size={16} /> },
                    { name: 'Biometrics', dev: <Check size={16} />, other: <X size={16} />, us: <Check size={16} /> },
                    { name: 'No Code', dev: <X size={16} />, other: <Check size={16} />, us: <Check size={16} /> },
                 ].map((row, i) => (
                    <div key={i} className="grid grid-cols-3 md:grid-cols-4 border-b border-zinc-800/50 text-xs md:text-sm hover:bg-zinc-900/20 transition-colors">
                       <div className="p-3 md:p-5 font-medium text-white flex items-center">{row.name}</div>
                       <div className="p-3 md:p-5 text-zinc-500 flex items-center justify-center">{row.dev}</div>
                       <div className="hidden md:flex p-5 text-zinc-500 items-center justify-center">{row.other}</div>
                       <div className="p-3 md:p-5 text-white font-bold bg-emerald-900/5 flex items-center justify-center">{row.us}</div>
                    </div>
                 ))}
                 
                 {/* Footer Row */}
                 <div className="grid grid-cols-3 md:grid-cols-4 bg-zinc-900/30">
                    <div className="p-3 md:p-6"></div>
                    <div className="p-3 md:p-6 text-center text-[10px] md:text-xs text-zinc-600">High Risk</div>
                    <div className="hidden md:block p-6 text-center text-xs text-zinc-600">Limited</div>
                    <div className="p-3 md:p-6 flex justify-center">
                       <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] md:text-xs font-bold px-3 py-2 md:px-4 md:py-2 rounded-lg transition-colors whitespace-nowrap">
                          Start Building
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};
