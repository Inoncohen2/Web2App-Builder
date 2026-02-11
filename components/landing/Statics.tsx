
import React from 'react';
import Image from 'next/image';
import { 
  Cloud, Github, Bell, Fingerprint, Activity, WifiOff, Compass, Link2, ScanLine 
} from 'lucide-react';

// Custom Tech Icons
const AppleLogo = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" height="1em" width="1em">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
  </svg>
);

const AndroidLogo = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" height="1em" width="1em">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

const RECENT_APPS = [
  { name: "FamilyStock", cat: "Finance", icon: "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770241944/94C9AF9D-5295-4AF5-B994-6DEC25F9D212_zhyjyx.png" },
  { name: "Moni", cat: "Finance", icon: "https://my-moni.vercel.app/assets/logo-character-PmhjommG.png" },
  { name: "FinZone", cat: "Finance", icon: "https://vercel.com/api/v0/deployments/dpl_CequiWvWzp8udrPXmH9hhsA7U9mb/favicon?project=finzone&readyState=READY&teamId=team_M9VZFZRJgI5y8oKFNMixmzMu&dpl=dpl_46nNpNFVRbug38TDqdTXwZG9mckZ" },
  { name: "MyWorth", cat: "Finance", icon: "https://vercel.com/api/v0/deployments/dpl_4jG1ccLcWMwGYqtssdXC8ggGtmQ7/favicon?project=myworth&readyState=READY&teamId=team_M9VZFZRJgI5y8oKFNMixmzMu&dpl=dpl_46nNpNFVRbug38TDqdTXwZG9mckZ" },
  { name: "MatchVacuum", cat: "Lifestyle", icon: "https://vercel.com/api/v0/deployments/dpl_AFBpsu4xVcJCB6BJAfhF4aqFwigM/favicon?project=match-vacuum&readyState=READY&teamId=team_M9VZFZRJgI5y8oKFNMixmzMu&dpl=dpl_46nNpNFVRbug38TDqdTXwZG9mckZ" },
];

const BUILDERS_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=faces"
];

export const SocialProof = () => {
  const items = [...RECENT_APPS, ...RECENT_APPS, ...RECENT_APPS, ...RECENT_APPS];
  return (
    <div className="w-full bg-black border-b border-white/5 py-8 overflow-hidden relative z-20 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-6 relative z-30">
         <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
               {BUILDERS_AVATARS.map((src, i) => (
                 <div key={i} className="relative h-6 w-6 rounded-full border border-black overflow-hidden">
                    <Image src={src} alt="User" fill className="object-cover" />
                 </div>
               ))}
            </div>
            <span className="text-xs text-zinc-500 font-mono">
              <span className="text-emerald-500 font-bold text-sm">124+</span> apps built
            </span>
         </div>
         <div className="hidden md:block w-px h-8 bg-zinc-800"></div>
         <div className="flex items-center gap-4 p-2 rounded-xl bg-white/5 border border-white/5 px-4 backdrop-blur-sm">
             <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Core:</span>
             <div className="flex items-center gap-5 text-zinc-400">
                 <div className="flex items-center gap-2 hover:text-white transition-colors"><AndroidLogo /><span className="text-xs font-medium">Android</span></div>
                 <div className="flex items-center gap-2 hover:text-white transition-colors"><AppleLogo /><span className="text-xs font-medium">iOS</span></div>
                 <div className="hidden sm:flex items-center gap-2 hover:text-white transition-colors"><Cloud size={14} /><span className="text-xs font-medium">Cloud</span></div>
                 <div className="hidden sm:flex items-center gap-2 hover:text-white transition-colors"><Github size={14} /><span className="text-xs font-medium">GitHub</span></div>
             </div>
         </div>
      </div>
      <div className="relative w-full">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
        <div className="flex w-max animate-marquee">
          {items.map((app, i) => (
            <div key={i} className="flex items-center gap-3 mx-6 opacity-40 hover:opacity-100 transition-opacity duration-300 cursor-default">
              {app.icon ? (<div className="relative h-8 w-8 rounded-lg overflow-hidden shadow-lg bg-zinc-900 border border-zinc-800"><Image src={app.icon} alt={app.name} fill className="object-cover" /></div>) : (<div className={`h-8 w-8 rounded-lg bg-zinc-800 shadow-lg flex items-center justify-center text-white font-bold text-xs`}>{app.name[0]}</div>)}
              <div className="flex flex-col"><span className="text-xs font-bold text-zinc-300">{app.name}</span><span className="text-[9px] text-zinc-600 uppercase tracking-wider">{app.cat}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const NativeFeatures = () => {
  const features = [
    { id: "01", title: "Push Notifications", desc: "Direct access to Firebase Cloud Messaging (FCM). Re-engage users instantly.", icon: Bell, stat: "FCM_READY" },
    { id: "02", title: "Biometric Auth", desc: "Hardware-level integration with FaceID & TouchID for secure login flows.", icon: Fingerprint, stat: "SECURE_ENCLAVE" },
    { id: "03", title: "Haptic Engine", desc: "Trigger physical feedback patterns for success, error, and selection states.", icon: Activity, stat: "TAPTIC_API" },
    { id: "04", title: "Offline Logic", desc: "Service workers & local caching strategies keep your app functional offline.", icon: WifiOff, stat: "CACHE_FIRST" },
    { id: "05", title: "Native Navigation", desc: "Overlays native UI controllers on top of webviews for native-feel transitions.", icon: Compass, stat: "NAV_CONTROLLER" },
    { id: "06", title: "Deep Linking", desc: "Handle universal links to route users directly to specific app screens.", icon: Link2, stat: "UNIVERSAL_LINK" },
  ];
  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden border-t border-zinc-900">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/20 border border-emerald-900/50 text-emerald-500 text-[10px] font-mono mb-8 tracking-widest uppercase"><ScanLine size={12} /> System Capabilities</div>
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter mb-6 text-balance">Native <span className="text-zinc-600">Hardware Access</span></h2>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-xl font-mono">// We don't just display your website.<br/>// We inject a JavaScript Bridge that gives your web code direct control over the device's native hardware APIs.</p>
            </div>
            <div className="hidden md:flex flex-col gap-4 font-mono text-xs text-zinc-500 border-l border-zinc-800 pl-8">
                <div className="flex gap-12"><div><div className="text-zinc-700 font-bold mb-1">TARGET_SDK</div><div className="text-zinc-300">Android 34</div></div><div><div className="text-zinc-700 font-bold mb-1">MIN_IOS</div><div className="text-zinc-300">15.0</div></div></div>
                <div className="flex gap-12"><div><div className="text-zinc-700 font-bold mb-1">BRIDGE_LATENCY</div><div className="text-emerald-500">~2ms</div></div><div><div className="text-zinc-700 font-bold mb-1">RENDER_ENGINE</div><div className="text-zinc-300">Metal/Vulkan</div></div></div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-zinc-800">
            {features.map((f, i) => (
                <div key={i} className="group relative bg-black border-r border-b border-zinc-800 p-8 sm:p-10 overflow-hidden hover:bg-zinc-900/20 transition-colors duration-500">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-700 ease-linear pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-transparent group-hover:border-emerald-500/50 transition-colors duration-300"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-transparent group-hover:border-emerald-500/50 transition-colors duration-300"></div>
                    <div className="absolute right-6 top-6 text-6xl font-black text-zinc-900 leading-none select-none font-mono opacity-50 group-hover:opacity-100 group-hover:text-zinc-800 transition-all duration-500">{f.id}</div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6 flex items-center gap-4"><div className="h-12 w-12 flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-emerald-500 group-hover:border-emerald-500/30 transition-all duration-300"><f.icon size={24} strokeWidth={1.5} /></div><div className="text-[10px] font-mono text-emerald-900 group-hover:text-emerald-500 transition-colors uppercase tracking-wider bg-emerald-500/5 px-2 py-1 rounded">{f.stat}</div></div>
                        <h3 className="text-xl font-bold text-zinc-200 group-hover:text-white mb-3 font-mono tracking-tight transition-colors">{f.title}</h3>
                        <p className="text-sm text-zinc-500 group-hover:text-zinc-400 leading-relaxed font-mono transition-colors">{f.desc}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};
