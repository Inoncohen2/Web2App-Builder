
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Download, RefreshCw, CircleAlert, Check, Smartphone, FileCode, Archive, Pencil, X, Save, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

// Brand Icons
const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" height="1.2em" width="1.2em">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
  </svg>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" height="1.2em" width="1.2em">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

interface BuildMonitorProps {
  buildStatus: 'idle' | 'building' | 'ready' | 'error';
  runId: number | string | null;
  onStartBuild: (type: 'apk' | 'aab') => void;
  onDownload: () => void;
  onBuildComplete: (success: boolean) => void;
  apkUrl?: string | null;
  packageName: string;
  onPackageUpdate: (name: string) => Promise<boolean>;
  lastBuildFormat: 'apk' | 'aab';
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  buildStatus, 
  runId, 
  onStartBuild, 
  onDownload, 
  onBuildComplete,
  apkUrl,
  packageName,
  onPackageUpdate,
  lastBuildFormat
}) => {
  const [progress, setProgress] = useState(0);
  const [pollStatus, setPollStatus] = useState<string | null>(null);
  
  // Local state for the Android card
  const [selectedFormat, setSelectedFormat] = useState<'apk' | 'aab'>('apk');
  const [isEditingPkg, setIsEditingPkg] = useState(false);
  const [tempPkgName, setTempPkgName] = useState(packageName);
  const [isSavingPkg, setIsSavingPkg] = useState(false);

  // Sync prop changes
  useEffect(() => {
    if (!isEditingPkg) {
      setTempPkgName(packageName);
    }
  }, [packageName, isEditingPkg]);

  // Polling Logic
  useEffect(() => {
    if (buildStatus !== 'building' || !runId) {
      if (buildStatus === 'idle') setProgress(0);
      if (buildStatus === 'ready') setProgress(100);
      return;
    }

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
    if (progress === 100 && buildStatus === 'building') setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (pollStatus === 'queued' || !pollStatus) return Math.min(prev + 0.5, 15);
        if (prev >= 90) return 90;
        return prev + (Math.random() * 1.5);
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [buildStatus, pollStatus]);

  const handleSavePackage = async () => {
    setIsSavingPkg(true);
    const success = await onPackageUpdate(tempPkgName);
    if (success) {
      setIsEditingPkg(false);
    }
    setIsSavingPkg(false);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      
      {/* CARD 1: iOS IPA (Disabled) */}
      <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3 text-zinc-500">
              <AppleIcon />
              <span className="font-bold text-lg tracking-tight">iOS IPA</span>
           </div>
           <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
           <Smartphone size={48} className="text-zinc-600 mb-4" />
           <p className="text-sm text-zinc-500 font-medium">Native iOS generation is currently in beta.</p>
        </div>
        <div className="mt-auto">
           <div className="w-full h-12 bg-zinc-800/50 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-600 font-bold text-sm cursor-not-allowed">
              Build Disabled
           </div>
        </div>
      </div>

      {/* CARD 2: iOS Source (Disabled) */}
      <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3 text-zinc-500">
              <AppleIcon />
              <span className="font-bold text-lg tracking-tight">iOS Source Code</span>
           </div>
           <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
           <FileCode size={48} className="text-zinc-600 mb-4" />
           <p className="text-sm text-zinc-500 font-medium">Swift source code export.</p>
        </div>
        <div className="mt-auto">
           <div className="w-full h-12 bg-zinc-800/50 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-600 font-bold text-sm cursor-not-allowed">
              Build Disabled
           </div>
        </div>
      </div>

      {/* CARD 3: Android APK/AAB (Active) */}
      <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[280px] shadow-lg shadow-black/50">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3 text-white">
              <AndroidIcon />
              <span className="font-bold text-lg tracking-tight">Android APK/AAB</span>
           </div>
           {buildStatus === 'building' && (
             <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded uppercase tracking-wider animate-pulse">Building</span>
           )}
           {buildStatus === 'ready' && (
             <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded uppercase tracking-wider">Current</span>
           )}
           {buildStatus === 'error' && (
             <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded uppercase tracking-wider">Error</span>
           )}
        </div>

        {/* --- STATE: IDLE or ERROR --- */}
        {(buildStatus === 'idle' || buildStatus === 'error') && (
           <>
              <div className="space-y-4 mb-auto">
                 {/* Format Selector */}
                 <div className="flex items-center justify-between bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button 
                      onClick={() => setSelectedFormat('apk')}
                      className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${selectedFormat === 'apk' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      APK (Recommended)
                    </button>
                    <button 
                      onClick={() => setSelectedFormat('aab')}
                      className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${selectedFormat === 'aab' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      AAB (Play Store)
                    </button>
                 </div>

                 {/* Package ID Section */}
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Package ID</label>
                    {isEditingPkg ? (
                       <div className="flex gap-2">
                          <input 
                            value={tempPkgName}
                            onChange={(e) => setTempPkgName(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 text-xs text-white h-8 font-mono focus:border-emerald-500 focus:outline-none"
                            placeholder="com.example.app"
                          />
                          <button onClick={handleSavePackage} disabled={isSavingPkg} className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg">
                             {isSavingPkg ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                          <button onClick={() => setIsEditingPkg(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 p-1.5 rounded-lg">
                             <X size={14} />
                          </button>
                       </div>
                    ) : (
                       <div className="flex items-center justify-between group">
                          <span className="text-sm font-mono text-zinc-300">{packageName || 'com.example.app'}</span>
                          <button onClick={() => setIsEditingPkg(true)} className="text-xs text-emerald-500 hover:text-emerald-400 font-medium flex items-center gap-1 opacity-80 hover:opacity-100">
                             Edit <Pencil size={10} />
                          </button>
                       </div>
                    )}
                 </div>
                 
                 {buildStatus === 'error' && (
                    <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-start gap-2">
                       <AlertTriangle size={14} className="text-red-500 mt-0.5" />
                       <p className="text-xs text-red-200">Build failed. Please check your config and try again.</p>
                    </div>
                 )}
              </div>

              <div className="mt-4">
                 <Button 
                   onClick={() => onStartBuild(selectedFormat)}
                   className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl shadow-lg shadow-white/5 active:scale-[0.98] transition-all"
                 >
                    Build {selectedFormat.toUpperCase()}
                 </Button>
              </div>
           </>
        )}

        {/* --- STATE: BUILDING --- */}
        {buildStatus === 'building' && (
           <div className="flex-1 flex flex-col justify-center">
              <div className="space-y-4">
                 <div className="flex justify-between text-xs text-zinc-400 mb-2">
                    <span>Building your app...</span>
                    <span>{Math.round(progress)}%</span>
                 </div>
                 <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    >
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[pulse_1s_linear_infinite]"></div>
                    </div>
                 </div>
                 <p className="text-center text-[10px] text-zinc-500 font-mono mt-4">
                    This usually takes about 2-3 minutes.
                 </p>
              </div>
           </div>
        )}

        {/* --- STATE: READY --- */}
        {buildStatus === 'ready' && (
           <>
              <div className="mb-auto space-y-4">
                 <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                       <Check size={14} className="text-emerald-500" />
                       <span className="text-xs font-bold text-emerald-400">Build Successful</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 pl-5">
                       Format: <span className="text-white font-mono uppercase">{lastBuildFormat}</span>
                    </p>
                 </div>
                 
                 <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Package ID</label>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-zinc-300">{packageName}</span>
                        <button onClick={() => setIsEditingPkg(true)} className="text-xs text-zinc-600 hover:text-emerald-500 transition-colors">Edit</button>
                    </div>
                    {isEditingPkg && (
                       <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col p-6 rounded-2xl">
                          <h4 className="text-white font-bold mb-4">Edit Package ID</h4>
                          <input 
                            value={tempPkgName}
                            onChange={(e) => setTempPkgName(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-white font-mono mb-4 focus:border-emerald-500 outline-none"
                          />
                          <div className="flex gap-2 mt-auto">
                             <Button onClick={() => setIsEditingPkg(false)} className="flex-1 bg-zinc-800 text-white">Cancel</Button>
                             <Button onClick={handleSavePackage} className="flex-1 bg-emerald-600 text-white">Save</Button>
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                 <button 
                   onClick={() => onStartBuild('apk')} // Reset to idle effectively by triggering new build flow or we could add a reset state
                   className="h-12 flex items-center justify-center gap-2 rounded-xl border border-zinc-700 text-white text-xs font-bold hover:bg-zinc-800 transition-colors"
                 >
                    <RefreshCw size={14} /> Rebuild
                 </button>
                 <button 
                   onClick={onDownload}
                   className="h-12 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all"
                 >
                    <Download size={14} /> Download {lastBuildFormat.toUpperCase()}
                 </button>
              </div>
           </>
        )}
      </div>

      {/* CARD 4: Android Source (Disabled) */}
      <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col h-[280px]">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3 text-zinc-500">
              <AndroidIcon />
              <span className="font-bold text-lg tracking-tight">Android Source</span>
           </div>
           <span className="text-[10px] font-bold bg-zinc-800 text-zinc-500 px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center opacity-40">
           <Archive size={48} className="text-zinc-600 mb-4" />
           <p className="text-sm text-zinc-500 font-medium">Full Gradle project export.</p>
        </div>
        <div className="mt-auto">
           <div className="w-full h-12 bg-zinc-800/50 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-600 font-bold text-sm cursor-not-allowed">
              Build Disabled
           </div>
        </div>
      </div>

    </div>
  );
};
