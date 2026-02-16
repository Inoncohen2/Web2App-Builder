
'use client';

import React, { useState } from 'react';
import { Settings2, X, AlertCircle, Loader2, FileCode, Smartphone, Check } from 'lucide-react';
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
  
  onStartBuild: (format: 'apk' | 'aab' | 'ipa' | 'ios_source' | 'source') => void;
  onCancelBuild: (buildId: string) => void;
  
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  androidState, 
  iosState, 
  onStartBuild, 
  onCancelBuild,
  packageName,
  onSavePackageName
}) => {
  const [isConfiguringAndroid, setIsConfiguringAndroid] = useState(false);
  const [isConfiguringIOS, setIsConfiguringIOS] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  
  const [showAndroidSelection, setShowAndroidSelection] = useState(false);
  const [showIOSSelection, setShowIOSSelection] = useState(false);

  // --- HELPER: Dynamic Subtitle ---
  const getStatusSubtitle = (state: BuildState, defaultText: string) => {
    // If currently working, show specific format
    if (state.status === 'building' || state.status === 'queued') {
        const fmt = state.format;
        let label = fmt?.toUpperCase();
        if (fmt === 'source' || fmt === 'ios_source') label = 'Source Code';
        
        return state.status === 'queued' ? `Queued (${label})...` : `Generating ${label}...`;
    }
    // Otherwise show default "Generate X, Y, Z"
    return defaultText;
  };

  // --- ANDROID HELPERS ---
  const isAndroidBusy = androidState.status === 'building' || androidState.status === 'queued';
  
  const handleAndroidClick = () => {
    if (isAndroidBusy) return;
    setShowAndroidSelection(!showAndroidSelection);
    setShowIOSSelection(false); 
  };
  
  const triggerAndroid = (fmt: 'apk' | 'aab' | 'source') => {
    setShowAndroidSelection(false);
    onStartBuild(fmt);
  };

  // --- iOS HELPERS ---
  const isIOSBusy = iosState.status === 'building' || iosState.status === 'queued';

  const handleIOSClick = () => {
    if (isIOSBusy) return;
    setShowIOSSelection(!showIOSSelection);
    setShowAndroidSelection(false); 
  };

  const triggerIOS = (fmt: 'ipa' | 'ios_source') => {
    setShowIOSSelection(false);
    onStartBuild(fmt);
  };

  // --- CONFIG ---
  const handleSaveConfig = async (platform: 'android' | 'ios') => {
    const success = await onSavePackageName(tempPackageName);
    if (success) {
        if (platform === 'android') setIsConfiguringAndroid(false);
        else setIsConfiguringIOS(false);
    }
  };

  const cancelConfig = (platform: 'android' | 'ios') => {
      setTempPackageName(packageName);
      if (platform === 'android') setIsConfiguringAndroid(false);
      else setIsConfiguringIOS(false);
  };

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* 1. iOS Card */}
      <div className={`
         rounded-xl p-5 shadow-sm transition-all duration-300 border bg-white
         ${isIOSBusy ? 'border-blue-600 ring-4 ring-blue-50' : 'border-zinc-800'}
      `}>
        <div className="flex items-center justify-between mb-4 gap-4">
           {/* Left Side: Text */}
           <div className="flex items-center gap-3 overflow-hidden min-w-0">
             <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-100 text-gray-500">
               <AppleIcon />
             </div>
             <div className="flex flex-col min-w-0">
               <h3 className="font-bold text-gray-900 truncate">iOS Build</h3>
               <p className="text-[10px] text-gray-500 font-medium truncate">
                  {getStatusSubtitle(iosState, 'Generate IPA & Source Code')}
               </p>
             </div>
           </div>
           
           {/* Right Side: Actions */}
           <div className="flex items-center gap-2 shrink-0">
             {!isIOSBusy && !showIOSSelection && (
                <Button 
                  variant="outline"
                  onClick={handleIOSClick} 
                  size="sm" 
                  className="h-9 px-5 text-xs font-bold bg-white text-black border-2 border-black hover:bg-gray-50 hover:text-black shadow-sm transition-colors"
                >
                    Build
                </Button>
             )}
           </div>
        </div>

        {/* iOS Selection */}
        {showIOSSelection && !isIOSBusy && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-gray-700">Choose iOS format:</p>
                  <button onClick={() => setShowIOSSelection(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => triggerIOS('ipa')}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                  >
                     <Smartphone size={20} className="mb-1 text-gray-600 group-hover:text-blue-600" />
                     <span className="text-sm font-bold text-gray-900">IPA</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Cloud Build</span>
                  </button>
                  <button 
                    onClick={() => triggerIOS('ios_source')}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-purple-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                  >
                     <FileCode size={20} className="mb-1 text-gray-600 group-hover:text-purple-600" />
                     <span className="text-sm font-bold text-gray-900">Source Code</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Xcode Project</span>
                  </button>
               </div>
            </div>
         )}
        
        {/* iOS Progress */}
        {isIOSBusy && (
             <div className="mb-2">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative mb-2">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full relative"
                        style={{ width: `${Math.max(5, iosState.progress || 0)}%` }}
                    >
                       <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin" />
                        {iosState.status === 'queued' ? 'Queued...' : `Building ${iosState.format?.toUpperCase() || 'IOS'}...`}
                    </span>
                    {iosState.id && (
                        <button onClick={() => onCancelBuild(iosState.id!)} className="text-xs text-red-500 hover:underline">Cancel</button>
                    )}
                </div>
             </div>
        )}

        {/* iOS Configuration Toggle */}
        {!isIOSBusy && (
             <div className="border-t border-gray-100 pt-3 mt-2">
                {!isConfiguringIOS ? (
                   <button 
                     onClick={() => { setIsConfiguringIOS(true); setTempPackageName(packageName); }}
                     className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                   >
                      <Settings2 size={12} /> Bundle ID: <span className="font-mono text-gray-400">{packageName}</span>
                   </button>
                ) : (
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                           <Settings2 size={12} /> Edit iOS Bundle ID
                         </span>
                      </div>
                      <input 
                        type="text" 
                        value={tempPackageName}
                        onChange={(e) => setTempPackageName(e.target.value)}
                        className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                      <div className="flex gap-2">
                         <Button onClick={() => handleSaveConfig('ios')} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => cancelConfig('ios')} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

      {/* 2. Android Card */}
      <div className={`
         rounded-xl p-5 shadow-sm transition-all duration-300 border bg-white
         ${isAndroidBusy ? 'border-blue-600 ring-4 ring-blue-50' : 'border-zinc-800'}
      `}>
         
         <div className="flex items-center justify-between mb-4 gap-4">
            {/* Left Side */}
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
               <div className="h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-100 text-gray-500">
                  <AndroidIcon />
               </div>
               <div className="flex flex-col min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">Android Build</h3>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                     {getStatusSubtitle(androidState, 'Generate APK, AAB & Source')}
                  </p>
               </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2 shrink-0">
               {!isAndroidBusy && !showAndroidSelection && (
                  <Button 
                    variant="outline"
                    onClick={handleAndroidClick} 
                    size="sm" 
                    className="h-9 px-5 bg-white text-black border-2 border-black hover:bg-gray-50 hover:text-black font-bold shadow-sm transition-colors"
                  >
                    Build
                  </Button>
               )}
            </div>
         </div>

         {/* Format Selection */}
         {showAndroidSelection && !isAndroidBusy && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-gray-700">Choose format:</p>
                  <button onClick={() => setShowAndroidSelection(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => triggerAndroid('apk')}
                    className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
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
                  <button 
                    onClick={() => triggerAndroid('source')}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-purple-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
                  >
                     <FileCode size={20} className="mb-1 text-gray-400 group-hover:text-purple-600" />
                     <span className="text-sm font-bold text-gray-900">Source</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1 group-hover:text-purple-600">Code</span>
                  </button>
               </div>
            </div>
         )}

         {/* Building State */}
         {isAndroidBusy && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative mb-3">
                 <div 
                    className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full relative"
                    style={{ width: `${Math.max(5, androidState.progress || 0)}%` }}
                 >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite_linear] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)]"></div>
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <Loader2 size={14} className="text-blue-600 animate-spin" />
                     <span className="text-xs font-bold text-blue-700">
                        {androidState.status === 'queued' ? 'Queued...' : `Building ${androidState.format?.toUpperCase()}...`}
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

         {/* Android Configuration Toggle */}
         {!isAndroidBusy && (
             <div className="border-t border-gray-100 pt-3 mt-2">
                {!isConfiguringAndroid ? (
                   <button 
                     onClick={() => { setIsConfiguringAndroid(true); setTempPackageName(packageName); }}
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
                         <Button onClick={() => handleSaveConfig('android')} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => cancelConfig('android')} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

    </div>
  );
};
