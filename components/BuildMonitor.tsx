
'use client';

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CircleAlert, Settings2, Check, Smartphone, FileCode, X } from 'lucide-react';
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

interface BuildMonitorProps {
  onStartBuild: (type: 'apk' | 'aab' | 'source' | 'ios-ipa' | 'ios-source') => void;
  onDownload: (url: string) => void;
  onCancel: (type: 'apk' | 'source' | 'ios-ipa' | 'ios-source') => void;
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
  
  // APK Specifics
  apkStatus: string; 
  apkProgress: number;
  apkUrl?: string | null;
  
  // Android Source
  sourceStatus: string;
  sourceProgress: number;
  sourceUrl?: string | null;

  // iOS Specifics
  iosStatus: string;
  iosProgress: number;
  ipaUrl?: string | null;
  
  // iOS Source
  iosSourceStatus: string;
  iosSourceProgress: number;
  iosSourceUrl?: string | null;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  onStartBuild, onDownload, onCancel, packageName, onSavePackageName,
  apkStatus, apkProgress, apkUrl,
  sourceStatus, sourceProgress, sourceUrl,
  iosStatus, iosProgress, ipaUrl,
  iosSourceStatus, iosSourceProgress, iosSourceUrl
}) => {
  // Local UI states
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  const [showAndroidFormatSelection, setShowAndroidFormatSelection] = useState(false);

  useEffect(() => { setTempPackageName(packageName); }, [packageName]);

  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) setIsConfiguring(false);
  };

  const getStatusText = (status: string, progress: number) => {
      if (status === 'building') {
          if (progress < 10) return 'Initializing...';
          if (progress < 30) return 'Analyzing config...';
          if (progress < 60) return 'Compiling code...';
          if (progress < 90) return 'Signing package...';
          return 'Finalizing...';
      }
      if (status === 'cancelled') return 'Build Cancelled';
      if (status === 'failed') return 'Build Failed';
      return '';
  };

  const renderCard = (
    title: string, 
    subtitle: string, 
    icon: React.ReactNode, 
    status: string, 
    progress: number, 
    url: string | null | undefined, 
    onBuild: () => void, 
    onCancelBuild: () => void,
    formatSelection?: React.ReactNode,
    isIos = false
  ) => {
    const isBuilding = status === 'building';
    const isReady = status === 'ready' && !!url;
    
    // Determine border color
    let borderClass = 'border-zinc-800'; // Default
    if (isBuilding) borderClass = 'border-blue-600 ring-4 ring-blue-50';
    
    return (
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${borderClass}`}>
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                  {icon}
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">{title}</h3>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">{subtitle}</p>
               </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               {!isBuilding && !isReady && !formatSelection && (
                 <Button onClick={onBuild} size="sm" className={`h-9 px-4 font-bold ${isIos ? 'bg-gray-100 text-zinc-600 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                   {status === 'failed' || status === 'cancelled' ? 'Retry' : 'Build'}
                 </Button>
               )}
               {isReady && (
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded">
                     <Check size={10} strokeWidth={4} /> Ready
                   </div>
                   <Button onClick={onBuild} variant="outline" size="sm" className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-gray-700">
                     <RefreshCw size={14} className="mr-1.5" /> Rebuild
                   </Button>
                 </div>
               )}
            </div>
         </div>

         {formatSelection}

         {isBuilding && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-1000 ease-in-out rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                  </div>
                  <button onClick={onCancelBuild} className="text-black hover:text-gray-600 transition-colors" title="Cancel Build">
                      <X size={16} />
                  </button>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">{getStatusText(status, progress)}</p>
            </div>
         )}

         {isReady && url && (
            <div>
               <Button onClick={() => onDownload(url)} className={`w-full h-12 font-bold flex items-center justify-center gap-2 rounded-lg ${isIos ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100'}`}>
                  <Download size={18} /> Download
               </Button>
            </div>
         )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* 1. iOS IPA (Now Active) */}
      {renderCard(
        "iOS IPA", "Distribution Package", <AppleIcon />, 
        iosStatus, iosProgress, ipaUrl, 
        () => onStartBuild('ios-ipa'), 
        () => onCancel('ios-ipa'),
        undefined, true
      )}

      {/* 2. iOS Source Code (Now Active) */}
      {renderCard(
        "iOS Source Code", "Xcode Project", <FileCode size={20} />, 
        iosSourceStatus, iosSourceProgress, iosSourceUrl, 
        () => onStartBuild('ios-source'), 
        () => onCancel('ios-source'),
        undefined, true
      )}

      {/* 3. Android APK/AAB */}
      {renderCard(
        "Android APK", "Production Build", <AndroidIcon />,
        apkStatus, apkProgress, apkUrl,
        () => setShowAndroidFormatSelection(true),
        () => onCancel('apk'),
        showAndroidFormatSelection && apkStatus !== 'building' ? (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <p className="text-xs font-bold text-gray-700 mb-3">Choose build format:</p>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setShowAndroidFormatSelection(false); onStartBuild('apk'); }} className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Recommended</span>
                  </button>
                  <button onClick={() => { setShowAndroidFormatSelection(false); onStartBuild('aab'); }} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
               <button onClick={() => setShowAndroidFormatSelection(false)} className="w-full text-center text-xs text-gray-400 mt-2 hover:text-gray-600 p-1">Cancel</button>
            </div>
        ) : undefined
      )}

      {/* 4. Android Source Code */}
      {renderCard(
        "Android Source Code", "Gradle Project", <FileCode size={20} />,
        sourceStatus, sourceProgress, sourceUrl,
        () => onStartBuild('source'),
        () => onCancel('source')
      )}
      
      {/* Configuration Section (Always visible at bottom now) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-zinc-200">
         {!isConfiguring ? (
            <button onClick={() => setIsConfiguring(true)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
               <Settings2 size={12} /> Configure package settings
            </button>
         ) : (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Settings2 size={12} /> Package ID</span>
               </div>
               <input type="text" value={tempPackageName} onChange={(e) => setTempPackageName(e.target.value)} className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500" />
               <div className="flex gap-2">
                  <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                  <Button onClick={() => { setIsConfiguring(false); setTempPackageName(packageName); }} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
               </div>
            </div>
         )}
      </div>

    </div>
  );
};
