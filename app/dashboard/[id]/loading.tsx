
import React from 'react';
import { LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F6F8FA] flex flex-col items-center justify-center z-[9999]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-500">
         {/* Logo Container */}
         <div className="relative h-24 w-24 mb-8">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center z-10 border border-white/50 backdrop-blur-xl">
               <img 
                 src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                 alt="Logo" 
                 className="h-14 w-14 object-contain"
               />
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping duration-[2000ms]"></div>
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 animate-pulse duration-[3000ms]"></div>
         </div>

         {/* Text */}
         <div className="text-center space-y-3 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
               Web2App
            </h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 border border-gray-200/60 rounded-full shadow-sm">
               <LoaderCircle className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
               <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">Loading Workspace...</span>
            </div>
         </div>
      </div>
    </div>
  );
}
