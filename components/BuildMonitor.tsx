
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Download, RefreshCw, AlertCircle, Settings2, Play, Check } from 'lucide-react';
import { Button } from './ui/Button';

// Brand Icons
const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
  </svg>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

interface BuildMonitorProps {
  buildStatus: 'idle' | 'building' | 'ready';
  runId: number | string | null;
  onStartBuild: () => void;
  onDownload: () => void;
  onConfigure: () => void;
  onBuildComplete: (success: boolean) => void;
  apkUrl?: string | null;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  buildStatus, 
  runId, 
  onStartBuild, 
  onDownload, 
  onConfigure,
  onBuildComplete,
  apkUrl 
}) => {
  const [progress, setProgress] = useState(0);
  const [pollStatus, setPollStatus] = useState<string | null>(null);

  // Polling Logic
  useEffect(() => {
    if (buildStatus !== 'building' || !runId) {
      if (buildStatus === 'idle') setProgress(0);
      if (buildStatus === 'ready') setProgress(100);
      return;
    }

    // Start polling
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/build/status?runId=${runId}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (isMounted) {
          setPollStatus(data.status);
          if (data.status === 'completed') {
            if (data.conclusion === 'success') {
                setProgress(100);
                onBuildComplete(true);
            } else {
                onBuildComplete(false);
            }
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [runId, buildStatus, onBuildComplete]);

  // Visual Progress Simulation
  useEffect(() => {
    if (buildStatus !== 'building') return;

    // Reset progress when starting
    if (progress === 100 && buildStatus === 'building') setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Queue phase (slow)
        if (pollStatus === 'queued' || !pollStatus) return Math.min(prev + 0.5, 15);
        
        // In Progress phase (faster but caps at 90)
        if (prev >= 90) return 90;
        return prev + (Math.random() * 1.5);
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [buildStatus, pollStatus]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      
      {/* iOS Card (Disabled) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 opacity-60 grayscale-[0.5]">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3 text-gray-400">
              <AppleIcon />
              <span className="font-bold text-lg tracking-tight">iOS IPA</span>
           </div>
           <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200">
              Coming Soon
           </div>
        </div>
        
        {/* Mock Action Bar */}
        <div className="h-11 w-full bg-white rounded-xl flex items-center justify-center border border-gray-200">
           <span className="text-gray-300 font-medium text-sm">Build Disabled</span>
        </div>
        
        {/* Tooltip hint */}
        <div className="absolute top-4 right-4 text-gray-300">
           <AlertCircle size={16} />
        </div>
      </div>

      {/* Android Card (Active) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 p-6 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3 text-gray-900">
              <AndroidIcon />
              <span className="font-bold text-lg tracking-tight">Android APK/AAB</span>
           </div>
           
           {/* Status Badge */}
           {buildStatus === 'building' && (
             <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider animate-pulse border border-blue-100">
                BUILDING
             </div>
           )}
           
           {buildStatus === 'ready' && (
             <div className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-100 flex items-center gap-1">
                <Check size={10} strokeWidth={4} /> CURRENT
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="space-y-4">
            
            {/* IDLE STATE */}
            {buildStatus === 'idle' && (
               <div className="space-y-4">
                 <Button 
                    onClick={onStartBuild}
                    className="w-full h-11 bg-black hover:bg-gray-800 text-white border border-transparent rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-[0.99] flex items-center justify-between px-4 group"
                 >
                    <span>Build</span>
                    <AndroidIcon />
                 </Button>
                 <div className="flex justify-center">
                    <button 
                      onClick={onConfigure}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                       <Settings2 size={12} /> Configure package settings
                    </button>
                 </div>
               </div>
            )}

            {/* BUILDING STATE */}
            {buildStatus === 'building' && (
               <div className="py-2">
                 {/* Visual Progress Bar */}
                 <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-300 ease-out rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      style={{ width: `${progress}%` }}
                    >
                       {/* Striped Animation Overlay */}
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_1s_linear_infinite]"></div>
                    </div>
                 </div>
                 <p className="text-center text-xs text-gray-400 mt-3 font-medium animate-pulse">
                    Building your app... ({Math.round(progress)}%)
                 </p>
               </div>
            )}

            {/* READY STATE */}
            {buildStatus === 'ready' && (
               <div className="grid grid-cols-2 gap-4">
                  {/* Rebuild: White Background, Black Text, Black Border */}
                  <Button 
                    onClick={onStartBuild}
                    className="h-12 bg-white hover:bg-zinc-50 text-black border-2 border-black rounded-xl font-bold text-sm shadow-sm transition-transform active:scale-[0.99] flex items-center justify-between px-4"
                  >
                     <div className="flex items-center gap-2"><RefreshCw size={14} /> Rebuild</div>
                     <AndroidIcon />
                  </Button>

                  {/* Download: Black Background, White Text (Primary) */}
                  <Button 
                    onClick={onDownload}
                    className={`h-12 rounded-xl font-bold text-sm transition-transform active:scale-[0.99] border-2 flex items-center justify-between px-4 ${apkUrl ? 'bg-black hover:bg-zinc-800 text-white border-black' : 'bg-zinc-100 text-zinc-400 border-zinc-100 cursor-not-allowed'}`}
                    disabled={!apkUrl}
                  >
                     {apkUrl ? (
                        <>Download <Download size={16} /></>
                     ) : (
                        <><span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Finalizing...</span></>
                     )}
                  </Button>
               </div>
            )}

        </div>
      </div>

    </div>
  );
};
