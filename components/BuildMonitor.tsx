
'use client';

import React, { useState } from 'react';
import { Download, RefreshCw, Settings2, X, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';

// --- ICONS ---
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

export interface BuildState {
  id: string | null;
  status: 'idle' | 'queued' | 'building' | 'ready' | 'failed' | 'cancelled';
  progress: number;
  downloadUrl: string | null;
  format: string | null;
  runId: string | number | null;
}

interface BuildMonitorProps {
  androidState: BuildState;
  iosState: BuildState;
  
  onStartBuild: (format: 'apk' | 'aab' | 'ipa' | 'ios_source') => void;
  onCancelBuild: (buildId: string) => void;
  onDownload: (buildId: string) => void;
  
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  androidState, 
  iosState, 
  onStartBuild, 
  onCancelBuild,
  onDownload,
  packageName,
  onSavePackageName
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  
  const [showAndroidSelection, setShowAndroidSelection] = useState(false);

  // --- ANDROID HELPERS ---
  const isAndroidBusy = androidState.status === 'building' || androidState.status === 'queued';
  const isAndroidReady = androidState.status === 'ready';
  
  const handleAndroidClick = () => {
    if (isAndroidBusy) return;
    setShowAndroidSelection(true);
  };
  
  const triggerAndroid = (fmt: 'apk' | 'aab') => {
    setShowAndroidSelection(false);
    onStartBuild(fmt);
  };

  // --- iOS HELPERS ---
  const isIOSBusy = iosState.status === 'building' || iosState.status === 'queued';
  const isIOSReady = iosState.status === 'ready';

  // --- CONFIG ---
  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) setIsConfiguring(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* 1. iOS Card (Parallel) */}
      <div className={`
         rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${isIOSBusy ? 'bg-white border-blue-600 ring-4 ring-blue-50' : 
           isIOSReady ? 'bg-white border-emerald-500 ring-4 ring-emerald-50' : 'bg-white border-gray-200'}
      `}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isIOSReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <AppleIcon />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS Build</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">IPA / Source</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {!isIOSBusy && (
               <div className="flex gap-2">
                 {/* For now iOS build usually means IPA or Source. Let's offer IPA if configured or default to source msg */}
                 <Button onClick={() => onStartBuild('ipa')} size="sm" variant="outline" className="h-8 px-3 text-xs">IPA</Button>
               </div>
             )}
              {isIOSReady && (
                <Button onClick={() => onDownload(iosState.id!)} size="sm" className="h-8 px-4 bg-emerald-600 text-white">
                    <Download size={14} className="mr-1" /> Download
                </Button>
             )}
           </div>
        </div>
        
        {/* iOS Progress */}
        {isIOSBusy && (
             <div className="mb-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative mb-2">
                    <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 rounded-full w-1/2 animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600 font-medium animate-pulse">Building iOS...</span>
                    {iosState.id && (
                        <button onClick={() => onCancelBuild(iosState.id!)} className="text-xs text-red-500 hover:underline">Cancel</button>
                    )}
                </div>
             </div>
        )}
      </div>

      {/* 2. Android Card (Mutually Exclusive APK/AAB) */}
      <div className={`
         rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${isAndroidBusy ? 'bg-white border-blue-600 ring-4 ring-blue-50' : 
           isAndroidReady ? 'bg-white border-emerald-500 ring-4 ring-emerald-50' : 'bg-white border-zinc-800'}
      `}>
         
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isAndroidReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-900 border-black text-white'}`}>
                  <AndroidIcon />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">Android Build</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                     {androidState.format ? androidState.format.toUpperCase() : 'APK / AAB'}
                  </p>
               </div>
            </div>

            <div>
               {!isAndroidBusy && !showAndroidSelection && (
                 <Button onClick={handleAndroidClick} size="sm" className="h-9 px-5 bg-black text-white hover:bg-gray-800 font-bold shadow-sm">
                   {isAndroidReady ? 'Rebuild' : 'Build'}
                 </Button>
               )}

               {isAndroidReady && !showAndroidSelection && androidState.id && (
                 <Button onClick={() => onDownload(androidState.id!)} variant="outline" size="sm" className="h-9 px-4 ml-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                    <Download size={14} className="mr-1.5" /> Download
                 </Button>
               )}
            </div>
         </div>

         {/* Format Selection (Only if Idle) */}
         {showAndroidSelection && !isAndroidBusy && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-gray-700">Choose format:</p>
                  <button onClick={() => setShowAndroidSelection(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => triggerAndroid('apk')}
                    className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Universal</span>
                  </button>
                  <button 
                    onClick={() => triggerAndroid('aab')}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
            </div>
         )}

         {/* Building State */}
         {isAndroidBusy && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative mb-3">
                 <div className="absolute inset-0 bg-blue-600 w-2/3 animate-[shimmer_1.5s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
                 <div className="absolute inset-0 bg-blue-600 w-1/2 opacity-20"></div>
                 <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                     <span className="text-xs font-bold text-blue-700">
                        Building {androidState.format?.toUpperCase()}...
                     </span>
                 </div>
                 {androidState.id && (
                     <button onClick={() => onCancelBuild(androidState.id!)} className="text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">
                         Cancel
                     </button>
                 )}
              </div>
            </div>
         )}
         
         {/* Error State */}
         {androidState.status === 'failed' && (
             <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2 text-red-700 text-xs">
                 <AlertCircle size={14} /> Build failed. Please check configuration and try again.
             </div>
         )}

         {/* Configuration Toggle */}
         {!isAndroidBusy && (
             <div className="border-t border-gray-100 pt-3 mt-2">
                {!isConfiguring ? (
                   <button 
                     onClick={() => setIsConfiguring(true)}
                     className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                   >
                      <Settings2 size={12} /> Package ID: <span className="font-mono text-gray-400">{packageName}</span>
                   </button>
                ) : (
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                           <Settings2 size={12} /> Edit Package ID
                         </span>
                      </div>
                      <input 
                        type="text" 
                        value={tempPackageName}
                        onChange={(e) => setTempPackageName(e.target.value)}
                        className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                      <div className="flex gap-2">
                         <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => { setIsConfiguring(false); setTempPackageName(packageName); }} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

    </div>
  );
};
